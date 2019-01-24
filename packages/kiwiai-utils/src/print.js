// @flow

export function println( ...messages: Array<string> ): void {
  if ( messages.length > 0 ) {
    messages.forEach(( message ) => {
      console.log( message );
    });
  } else {
    console.log();
  }
}

export function printError( error: string | { message: string }): void {
  let text = error;
  if ( typeof error === 'object' ) {
    text = error.message;
  }
  console.log();
  console.log( text );
  console.log();
}
