// @flow

import { fork } from 'child_process';
import send, { RESTART }  from './send';

// nodejs 调试参数 --inspect-brk 程序开始短点
//                --inspect

let usedPorts = [];
function start( path: string ) {

  // from af-webpack / fork
  // 重置调试器端口
  // 我感觉这个估计用不到
  const execArgv = process.execArgv.slice( 0 );
  const inspectArgvIndex = execArgv.findIndex( argv =>
    argv.includes( '--inspect-brk' )
  );

  // 重置端口加一
  // 程序如果写的比较复杂,子线程比较多
  // 调试每一个子线程就必须把子线程的调试端口分开(分别加 1 )
  if ( inspectArgvIndex > -1 ) {
    const inspectArgv = execArgv[inspectArgvIndex];
    execArgv.splice(
      inspectArgvIndex,
      1,
      inspectArgv.replace( /--inspect-brk=(.*)/, ( match_, s1 ) => {
        let port;
        try {
          port = parseInt( s1 ) + 1;
        } catch ( e ) {
          port = 9230; // node default inspect port plus 1.
        }
        if ( usedPorts.includes( port )) {
          port++;
        }
        usedPorts.push( port );
        return `--inspect-brk=${port}`;
      }),
    );
  }

  // 获取参数从第二个字符串开始
  const childProcess = fork( path, process.argv.slice( 2 ), { execArgv });
  childProcess.on( 'message', ( data ) => {
    // 如果自己用不上就向父进程传递消息
    if ( data && data.type === RESTART ) {
      childProcess.kill();
      start( path );
    }
    send( data );
  });

}


export default function( path: string, callback: function ) {
  // 子进程才有 send
  if ( !process.send ) {
    start( path );
  } else {
    callback();
  }
}