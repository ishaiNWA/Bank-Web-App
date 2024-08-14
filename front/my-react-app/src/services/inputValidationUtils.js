
export function isValidName(name) {

    let nameRegex = /^[a-zA-Z]{1,20}$/;
    return nameRegex.test(name);
  }
  
  export function isValidEmailAddress(email) {
    let emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  
    return emailRegex.test(email)
  }
  
  export function isValidPassword(password) {
  
    console.log("login password is");
    console.log(password);
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{5,20}$/;
    return passwordRegex.test(password);
  }
  
  
  export function isMatchingPasswords(password, passwordConfirmation) {
    return password === passwordConfirmation;
  }

  export function isValidTransactionAmount(amount){
    console.log(console.log(typeof amount));
    console.log("amount is: " + amount);
    const regex = /^[1-9]\d*$/;
    return regex.test(amount);
  }
  