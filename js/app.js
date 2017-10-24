// polyfill for removing items from an array
Array.prototype.remove = function() {
    var what, a = arguments,
        L = a.length,
        ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

// object to keep track of the activities
const activities = {
    'all': {
        time: {
            start: undefined,
            end: undefined
        },
        day: undefined,
        cost: 200
    },
    'js-frameworks': {
        time: {
            start: 900,
            end: 1200
        },
        day: 'Tuesday',
        cost: 100
    },
    'js-libs': {
        time: {
            start: 1300,
            end: 1600
        },
        day: 'Tuesday',
        cost: 100
    },
    'express': {
        time: {
            start: 900,
            end: 1200
        },
        day: 'Tuesday',
        cost: 100
    },
    'node': {
        time: {
            start: 1300,
            end: 1600
        },
        day: 'Tuesday',
        cost: 100
    },
    'build-tools': {
        time: {
            start: 900,
            end: 1200
        },
        day: 'Wednesday',
        cost: 100
    },
    'npm': {
        time: {
            start: 1300,
            end: 1600
        },
        day: 'Wednesday',
        cost: 100
    }
};

$(document).ready(function() {
    // Focus the first form element
    $('#name').focus();
    // Hide the "other" job role field
    $('#other-title').hide();

    // detect when the job role is changed
    $('#title').change(function() {
        var val = $(this).val();
        // if it is 'other' then show the other role input
        if (val == 'other') {
            $('#other-title').show();
        } else { // otherwise hide it
            $('#other-title').hide();
        }
    })

    // detect when the shirt design select is changed
    $('#design').change(function() {
        var val = $(this).val();

        // make sure val is a truey value and not the default "Select Theme" option
        if (val) {
            if (val == 'js-puns') {
                // hide all the shirt designs
                $('#color option').hide();
                // and only show the relavent ones
                $('option[value="cornflowerblue"]').show();
                $('option[value="darkslategrey"]').show();
                $('option[value="gold"]').show();
            } else if (val == 'heart-js') {
                // hide all the shirt designs
                $('#color option').hide();
                // and only show the relavent ones
                $('option[value="tomato"]').show();
                $('option[value="steelblue"]').show();
                $('option[value="dimgrey"]').show();
            }
        }
    });

    var selectedActivities = [];

    // detect when a checkbox is changed
    $('.activities input[type="checkbox"]').change(function() {
        var val = $(this).is(':checked');
        var name = $(this).attr('name');
        if (val) {
            // if checked add it to the list of selected activities
            selectedActivities.push(name);
        } else {
            //if unchecked remove it from the list
            selectedActivities.remove(name);
        }

        // now to filter the activities that conflict with the selected ones...

        // array to store the activites that should be disabled
        var disabledActivities = [];
        // the total cost of all the activities
        var totalPrice = 0;
        // check what activities conflict with selected activities
        selectedActivities.forEach(function(selectedActivity) {
            var activity = activities[selectedActivity];
            totalPrice += activity.cost;
            // check that it has applicable parameters for filtering the other activities    
            if ((activity.time.start && activity.time.end) || activity.day) {
                // loop through all the activities
                for (let key in activities) {
                    // make sure we're not disabling any of the selected activities
                    if (selectedActivity.indexOf(key) > -1)
                        continue;
                    //the activity to compare to
                    let compareActivity = activities[key];
                    // if the event starts after the checked event
                    if (compareActivity.time.start >= activity.time.start) {
                        // and if it starts before the end of the selected event
                        if (compareActivity.time.start <= activity.time.end) {
                            // and if it's on the same day
                            if ((activity.day && compareActivity.day) && activity.day == compareActivity.day) {
                                disabledActivities.push(key);
                            }
                        }
                    }
                }
            }
        });

        // enable all the activities
        $('.activities input[type="checkbox"]').prop('disabled', false);
        // disable the ones in the array
        disabledActivities.forEach(function(disabledActivity) {
                $('.activities input[type="checkbox"][name="' + disabledActivity + '"]').prop('disabled', true);
            })
            // display the cost
        $('#activity-cost').html(`Total: $${totalPrice}`);

        validateActivities();
    })

    // detect when the user selected a payment method
    $('#payment').change(function() {
        // get the selected payment method
        var val = $(this).val();
        // hide everything first
        $('#credit-card').hide();
        $('#paypal-info').hide();
        $('#bitcoin-info').hide();
        // and then only show the relivant one
        if (val == 'credit-card') {
            $('#credit-card').show();
        } else if (val == 'paypal') {
            $('#paypal-info').show();
        } else if (val == 'bitcoin') {
            $('#bitcoin-info').show();
        }
    });

    // set the credit card as the default payment method
    $('#payment').val('credit-card');
    // and hide the other methods
    $('#paypal-info').hide();
    $('#bitcoin-info').hide();

    // checks the form for validation errors
    function validateForm() {
        var errors = false;

        // set errors to true if there is a validation error with the field
        if (validateName() && !errors)
            errors = true;


        // set errors to true if there is a validation error with the field
        if (validateEmail() && !errors)
            errors = true;

        if (validateActivities() && !errors)
            errors = true;

        // clear any previous errors
        $('#shirt-error').html();

        // if a shirt isn't selected
        if ($('#design').val() == 'select') {
            $('#shirt-error').append('Please select a shirt');
            errors = true;
        }

        // clear the previous payment error (if any)
        $('#payment-error').html('');
        // if the user selected credit card as their payment method
        if ($('#payment').val() == 'credit-card') {

            // set errors to true if there is a validation error with the field
            if (validateCreditCardNumber() && !errors)
                errors = true;

            // set errors to true if there is a validation error with the field
            if (validateCreditCardZip() && !errors)
                errors = true;

            // set errors to true if there is a validation error with the field
            if (validateCreditCardCVV() && !errors)
                errors = true;
        }
        // if a payment method hasn't been selected
        if ($('#payment').val() == 'select_method') {
            $('#payment-error').append('Please selected a payment method')
            errors = true;
        }
        return errors;
    }

    function validateActivities() {
        var errors = false;
        // clear any previous errors
        $('#activity-error').html('');

        // if no activities are selected
        if (selectedActivities.length == 0) {
            $('#activity-error').append('<p>Please select at least 1 activity</p>');
            errors = true;
        }

        return errors;
    }

    function validateName() {
        var errors = false;

        // clear any previous errors
        $('#name-error').html('');

        // if name is blank
        if ($('#name').val() == '') {
            errors = true;
            $('#name-error').append('Please enter your name');
            // if there's an error, set the border to red
            $('#name').css({
                'border-color': 'red'
            })
        } else {
            // if no error, set the border color to normal
            $('#name').css({
                'border-color': '#c1deeb'
            })
        }
        // tell the caller if there was an error
        return errors;
    }

    function validateEmail() {
        var errors = false;

        // clear any previous errors
        $('#email-error').html('');

        // if mail is blank
        if ($('#mail').val() == '') {
            errors = true;
            $('#email-error').append('Please enter your email address');
            // if there's an error, set the border to red
            $('#mail').css({
                'border-color': 'red'
            })
        } else {
            // if it's not blank, check if it's valid
            if (!(/^[a-zA-Z1-90.]*\@[a-zA-Z1-90]*\.[a-zA-Z]*$/.test($('#mail').val()))) {
                errors = true;
                $('#email-error').append('Please use a valid email');
                // if there's an error, set the border to red
                $('#mail').css({
                    'border-color': 'red'
                })
            } else {
                // if no error, set the border color to normal
                $('#mail').css({
                    'border-color': '#c1deeb'
                })
            }
        }
        // tell the caller if there was an error
        return errors;
    }

    function validateCreditCardNumber() {
        var errors = false;
        // clear any previous errors
        $('#cc-num-error').html('');

        //if the user hasn't entered a credit card number
        if ($('#cc-num').val() == '') {
            errors = true;
            $('#cc-num-error').append('Please enter a credit card number');
            // if there's an error, set the border to red
            $('#cc-num').css({
                'border-color': 'red'
            })
        } else {
            //check that the number is between 13 and 16 digits
            if (!(/^[0-9]{13,16}$/.test($('#cc-num').val()))) {
                errors = true;
                $('#cc-num-error').append('Invalid credit card number, must be between 13 and 16 digits');
                // if there's an error, set the border to red
                $('#cc-num').css({
                    'border-color': 'red'
                })
            } else {
                // if no error, set the border color to normal
                $('#cc-num').css({
                    'border-color': '#c1deeb'
                })
            }
        }
        // tell the caller if there was an error
        return errors;
    }

    function validateCreditCardZip() {
        var errors = false;

        // clear any previous errors
        $('#cc-zip-error').html('');

        // if no zip code was entered
        if ($('#zip').val() == '') {
            errors = true;
            $('#cc-zip-error').append('Please enter a zip code');
            // if there's an error, set the border to red
            $('#zip').css({
                'border-color': 'red'
            })
        } else {
            // check that it's 5 digits
            if (!(/^[0-9]{5}$/.test($('#zip').val()))) {
                errors = true;
                $('#cc-zip-error').append('Invalid zip code, must be 5 digits');
                // if there's an error, set the border to red
                $('#zip').css({
                    'border-color': 'red'
                })
            } else {
                // if no error, set the border color to normal
                $('#zip').css({
                    'border-color': '#c1deeb'
                })
            }
        }
        // tell the caller if there was an error
        return errors;
    }

    function validateCreditCardCVV() {
        var errors = false;
        // clear any previous errors
        $('#cc-cvv-error').html('');

        // check that a cvv was entered
        if ($('#cvv').val() == '') {
            errors = true;
            $('#cc-cvv-error').append('Please enter a CCV');
            // if there's an error, set the border to red
            $('#cvv').css({
                'border-color': 'red'
            })
        } else {
            // check that it's 3 digits
            if (!(/^[0-9]{3}$/.test($('#cvv').val()))) {
                errors = true;
                $('#cc-cvv-error').append('Invalid CCV, must be 3 digits');
                // if there's an error, set the border to red
                $('#cvv').css({
                    'border-color': 'red'
                })
            } else {
                // if no error, set the border color to normal
                $('#cvv').css({
                    'border-color': '#c1deeb'
                })
            }
        }

        // tell the caller if there was an error
        return errors;
    }

    $('form').submit(function(e) {
        // if true there where errors
        if (validateForm())
            e.preventDefault();
    })

    // validate the name on keyup
    $('#name').keyup(() => validateName())

    // validate the email on keyup
    $('#mail').keyup(() => validateEmail())

    // validate the cc number on keyup
    $('#cc-num').keyup(() => validateCreditCardNumber())

    // validate the cc zip on keyup
    $('#zip').keyup(() => validateCreditCardZip())

    // validate the cc ccv on keyup
    $('#cvv').keyup(() => validateCreditCardCVV())

    // hide color label and select menu
    $('#colors').hide();
    // show when a design is selected
    $('#design').change(function() {
        if ($('#design').val() == 'select') {
            $('#colors').hide();
            $('#colors').css({
                'display': 'none'
            })
        } else {
            $('#colors').show();
            $('#colors').css({
                'display': 'block'
            })
        }
    })
});