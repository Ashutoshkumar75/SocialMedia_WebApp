const isEmail = (email) => {
    const regEx =  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;;
    if(email.match(regEx)) return true;
    else return false;
}

const isEmpty = (string) => {
    if(string.trim() === '') return true;
    else return false;
}


exports.validateSignUpData = (data) => {
    let errors ={};
    if(isEmpty(data.email)){
        errors.email = 'must not be empty'
    } else if(!isEmail(data.email)){
        errors.email = 'Must be a valid email address'; 
    }

    if(isEmpty(data.password)) errors.password = 'Must not Empty';
    if(data.password !== data.confirmPassword) errors.confirmPassword = 'Password Must Match';
    if(isEmpty(data.handle)) errors.handle = 'Must not be Empty'


    return{
        errors,
        valid: Object.keys(errors).length === 0 ? true:false
    }

}


exports.validateLoginData = (data) =>{
    
    if(isEmpty(user.email)) errors.email = 'Must not be empty';
    if(isEmpty(user.password)) errors.password = 'Must not be Empty';

    return{
        errors,
        valid: Object.keys(errors).length === 0 ? true:false
    }
}
