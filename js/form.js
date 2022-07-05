
/**
    Contact Form Validatioon : Below Code used to validate Contact Form.
  */
const NAME_REGEX = /^[a-zA-Z ]*$/;
const EMAIL_REGEX = /^[\w]{1,}[\w.+-]{0,}@[\w-]{1,}([.][a-zA-Z]{2,3}|[.][\w-]{2,3}[.][a-zA-Z]{2,3})$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;

const NAME_ERROR = 'It must be Alphabets only';
const EMAIL_ERROR = 'Please include @ in the email address';
const PWD_ERROR = 'It must include uppercase, lowercase letters, a number and a speacial character.';
const CONFIRM_PWD_ERROR = 'It must match with the password';

const REGEXES = {
    'user_name': NAME_REGEX,
    'email': EMAIL_REGEX,
    'password': PWD_REGEX,
};

const ERROR_MESSAGES = {
    'user_name': NAME_ERROR,
    'email': EMAIL_ERROR,
    'password': PWD_ERROR,
    'confirm_password': CONFIRM_PWD_ERROR,
}

const cyrb53 = function (str, seed = 0) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};


/**
   emptyField : Function used to validate empty fields.
 */
const emptyField = (errorSpan, errMsg, fieldName) => {
    const fieldValue = (fieldName.value) ? fieldName.value : '';
    if (fieldValue === '' || fieldValue.length <= 0) {
        errorSpan.classList.add('error');
        fieldName.setAttribute('aria-invalid', true);
    } else {
        errorSpan.classList.remove('error');
        fieldName.setAttribute('aria-invalid', false);
    }
};

/*
   fieldValidation : Function used to display error if field is empty
   inputtxt : String - Field with error
   regex : String - To evaluate entered data
   errMsg : String - Message to be displayed when field is empty
 */
const fieldValidation = (inputtxt, errorSpan, regex, errMsg) => {
    errorSpan.classList.add('error');
    errorSpan.innerText = errMsg;
    inputtxt.setAttribute('aria-invalid', true);
    if (inputtxt.id === 'confirm_password') {
        if (inputtxt.value !== regex) {
            errorSpan.classList.add('error');
            errorSpan.innerText = errMsg;
            inputtxt.setAttribute('aria-invalid', true);
        } else {
            errorSpan.classList.remove('error');
            inputtxt.setAttribute('aria-invalid', false);
        }
    } else if (!inputtxt.value.match(regex)) {
        errorSpan.classList.add('error');
        errorSpan.innerText = errMsg;
        inputtxt.setAttribute('aria-invalid', true);
    } else {
        errorSpan.classList.remove('error');
        inputtxt.setAttribute('aria-invalid', false);
    }
};

/*
   validateData : Function used to validate empty fields and regex.
 */
const validateData = (field, errorSpan, regex, errMsg) => {
    if (field.value === '') {
        emptyField(errorSpan, 'Please complete this required field.', field);
    } else if (field.id === 'confirm_password') {
        const password = document.querySelector('#password').value;
        fieldValidation(field, errorSpan, password, errMsg);
    } else {
        fieldValidation(field, errorSpan, regex, errMsg);
    }
};

/*
     onFocusOut : Function used to validate data on focus out
   */
const onFocusOut = (e, errorSpan) => {
    validateData(e.target, errorSpan, getRegex(e.target.id), getErrorMessage(e.target.id));
};


const getRegex = (inputId) => {
    const regexValues = new Map(Object.entries(REGEXES));
    if (regexValues.has(inputId)) {
        return regexValues.get(inputId);
    }
    return '';
}

const getErrorMessage = (inputId) => {
    const errorValue = new Map(Object.entries(ERROR_MESSAGES));
    if (errorValue.has(inputId)) {
        return errorValue.get(inputId);
    }
    return '';
}

const isUserAlreadyExist = async (email, password) => {
    const user = new User();
    const isEmail = await user.isUserAlreadyExist(email, password, API_URL);
    return isEmail;
}

/**
   onSubmitForm : Function used to validate data on submit.
 */
const onSubmitForm = (e, inputFields, errorSpans) => {
    e.preventDefault();
    errorSpans.forEach((errorSpan, index) => {
        let isPasswordMatch = false;
        let isEmailValid = false;
        const errorSiblingInput = errorSpan.previousElementSibling.children[0];
        const inputField = inputFields[index];
        if (errorSiblingInput.id === inputField.id) {
            validateData(inputField, errorSpan, getRegex(inputField.id), getErrorMessage(inputField.id));
        }
    })
    const isValid = Array.from(errorSpans).every((errorSpan) => {
        if (errorSpan.classList.contains('error')) {
            return false;
        } else {
            return true;
        }
    })
    return isValid;
};

const onSubmitLoginForm = (e, inputFields, errorSpans) => {
    let isEmailValid = false;
    let isPasswordMatch = false;
    let email = document.querySelector(`#${e.target.id} #email`).value;
    let password = document.querySelector(`#${e.target.id} #password`).value;
    e.preventDefault();
    errorSpans.forEach((errorSpan, index) => {
        let isPasswordMatch = false;
        let isEmailValid = false;
        const errorSiblingInput = errorSpan.previousElementSibling.children[0];
        const inputField = inputFields[index];
        if (errorSiblingInput.id === inputField.id) {
            validateData(inputField, errorSpan, getRegex(inputField.id), getErrorMessage(inputField.id));
        }
    })
    isEmailValid = isUserAlreadyExist(email, password);
    const isValid = Array.from(errorSpans).every((errorSpan) => {
        if (errorSpan.classList.contains('error')) {
            return false;
        } else {
            return true;
        }
    })
    return isValid;
}


/**
   navigate : Function used to navigate to thank you page on form submit.
 */
const navigate = (navigateTo) => {
    window.location.href = `${window.location.origin}/${navigateTo}.html`;
};

const submitFormData = async (navigateTo, formData, myForm, isNavigating) => {
    const user = new User();
    let userData;
    if (myForm.id === 'register-form') {
        userData = await user.createUser(formData, API_URL);
    } else {
        userData = user.isLoggedIn;
    }

    if (userData.affectedRows && isNavigating) { navigate(navigateTo); }
};

/**
    handleSubmit : Function used to handle form validation and redirection.
*/
const handleSubmit = (e, inputFields, errorSpans) => {
    e.preventDefault();
    const myForm = document.getElementById(e.currentTarget.id);
    const navigateTo = (myForm.id === 'login-form') ? 'index' : 'login';
    const formData = new FormData(myForm);
    let isFormValidated = false;
    const isNavigating = true;
    if (formData) {
        if (onSubmitForm(e, inputFields, errorSpans)) {
            isFormValidated = true;
        }
    } else {
        return false;
    }

    if (isFormValidated) {
        submitFormData(navigateTo, formData, myForm, isNavigating);
    }
};

/**
    handleLogin : Function used to handle form validation and redirection.
*/
const handleLogin = (e, inputFields, errorSpans) => {
    e.preventDefault();
    const myForm = document.getElementById(e.currentTarget.id);
    const navigateTo = 'index';
    const formData = new FormData(myForm);
    let isFormValidated = false;
    const isNavigating = true;
    if (formData) {
        if (onSubmitLoginForm(e, inputFields, errorSpans)) {
            isFormValidated = true;
        }
    } else {
        return false;
    }
};

const form = document.querySelector('form');
const inputFields = document.querySelectorAll(`#${form.id} input`);
const errorSpans = document.querySelectorAll(`#${form.id} .note`);
errorSpans.forEach((errorSpan, index) => {
    inputFields[index].addEventListener('focusout', (e) => onFocusOut(e, errorSpan));
})
if (form.id === 'login-form') {
    form.addEventListener('submit', (e) => handleLogin(e, inputFields, errorSpans));
} else {
    form.addEventListener('submit', (e) => handleSubmit(e, inputFields, errorSpans));
}




class User {
    constructor(user_name, email, password, confirm_password, isLoggedIn) {
        this.user_name = user_name;
        this.email = email;
        this.password = password;
        this.confirm_password = confirm_password;
        this.isLoggedIn = isLoggedIn;
    }

    sendResponse(fetchResult, response) {
        if (fetchResult.ok) {
            return response.data;
        }
        const responseError = {
            type: 'Error',
            message: result.message || 'Something went wrong',
            data: result.data || '',
            code: result.code || '',
        };
        const error = new Error();
        error.info = responseError;

        return (error);
    }

    async getUser(id, apiUrl) {
        const userData = fetch(`${apiUrl}/user/${id}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
        const response = await userData.json();
        this.sendResponse(userData, response);
    }

    async isUserAlreadyExist(email, password, apiUrl) {
        const userData = await fetch(`${apiUrl}/user/${email}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
        const response = await userData.json();
        if (response.data[0].email === email) {
            const validPassword = (cyrb53(password).toString() === response.data[0].password);
            if(validPassword && true) {

                return true;
            } ;
        }
        return false;
    }

    async createUser(formData, apiUrl) {
        formData.append('is_logged_in', false);
        const fetchResult = await fetch(`${apiUrl}/user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(formData).toString(),
        }).catch((err) => err);
        const response = await fetchResult.json();
        return this.sendResponse(fetchResult, response);
    }

    async updateUser(data,apiUrl) {
        const fetchResult = await fetch(`${apiUrl}/user`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(formData).toString(),
        }).catch((err) => err);
        const response = await fetchResult.json();
        return this.sendResponse(fetchResult, response);
    }
}