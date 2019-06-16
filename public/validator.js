var validator = {};

validator.email = function (fieldName, val) {
    var pattern = /^\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b$/i
    if (!pattern.test(val)) {
        return 'Error: ' + fieldName + ' is invalid!';
    }
};

validator.required = function (fieldName, val) {
    val = val.trim();
    if (val === '') {
        return 'Error: ' + fieldName + ' is required!';
    }
};

validator.maxLength = function (fieldName, val, length) {
    val = (val + '').trim();
    if (val.length > length) {
        return 'Error: ' + fieldName + ' exited max characters ' + length;
    }
};

validator.minLength = function (fieldName, val, length) {
    val = (val + '').trim();
    if (val.length < length) {
        return 'Error: ' + fieldName + ' must be at least ' + length + ' characters!';
    }
}

validator.fixedLength = function (fieldName, val, length) {
    val = (val + '').trim();
    if (val.length !== length) {
        return 'Error: ' + fieldName + ' must be exactly ' + length + ' characters!';
    }
}

validator.isNumber = function (fieldName, val, length) {
    val = Number((val + '').trim());
    if (isNaN(val)) {
        return 'Error: ' + fieldName + ' must be numeric!';
    }
}