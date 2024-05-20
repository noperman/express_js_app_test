module.exports = (length,characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789')=>{
  let charactersLength = characters.length, result = ''

  for ( let i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}