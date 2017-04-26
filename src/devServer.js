
import WebpackDevServer from 'webpack-dev-server';
import paths from './utils/paths';
import print from './utils/print';
import clearConsole from './utils/clearConsole';

function addMiddleware( server ) {
  const { proxy, devServer } = server;
  devServer.use( historyApiFallback({
    disableDotRule: true,
    htmlAcceptHeaders: proxy ? [ 'text/html' ] : [ 'text/html', '*/*' ],
  }));
  devServer.use( devServer.middleware );
}

function setupWatch ( server ) {
  const { devServer, paths, watchFiles } = server;
  const watcher = chokidar.watch( watchFiles, {
    ignored: /node_modules/,
    persistent: true,
  } );
  watcher.on( 'change', ( path ) => {
    print( chalk.green( `File ${path.replace( paths.appDirectory, '.' )} changed, try to restart server` );
    watcher.close();
    devServer.close();
    process.send( 'RESTART' );
  });
  return server;
}

function runDevServer ( server ) {

  const host = process.env.HOST || 'localhost';
  const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';
  const { compiler, webpackConfig, port, proxy } = server;
  const devServer = new WebpackDevServer( compiler, {
    hot: true,
    compress: true,
    clientLogLevel: 'none',
    contentBase: paths.appPublic,
    publicPath: webpackConfig.output.publicPath,
    quiet: true,
    watchOptions: {
      ignored: /node_modules/,
    },
    https: protocol === 'https',
    host,
    proxy: proxy || {},
  });

  server.devServer = devServer;
  addMiddleware( server );
  // applyMock( devServer );

  devServer.listen( port, ( err ) => {

    if ( err ) {
      return print( err );
    }

    process.send( 'READY' );
    clearConsole();
    print( chalk.cyan( 'Starting the development server...' ))
    // if (isInteractive) {
    //   outputMockError();
    // }
  });

  setupWatch( server );
  return server;
}