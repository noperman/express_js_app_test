const ErrDeclaration = require("./Declare");

function searchByCode (value,array) {
  for (var i=0; i < array.length; i++) {
      if (array[i].code === value) {
          return array[i].msg;
      }
  }
}

module.exports = (code, data='') => {
  let msg = 'Errorcode is undefined' 
  let msgFromSearch = searchByCode(code, ErrDeclaration)

  if(msgFromSearch) msg = msgFromSearch+' '+data
  return msg
}