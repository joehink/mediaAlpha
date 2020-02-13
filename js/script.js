const areasOfStudy = [
    {
        subject: 'sports',
        icon: 'fas fa-football-ball',
        schedules: [
            {
                startDate: 'Thu Jul 23 2020 00:00:00 GMT-0700',
                endDate: 'Sun Aug 23 2020 00:00:00 GMT-0700'
            },
            {
                startDate: 'Wed Aug 26 2020 00:00:00 GMT-0700',
                endDate: 'Sat Sep 26 2020 00:00:00 GMT-0700'
            }
        ]
    },
    {
        subject: 'art',
        icon: 'fas fa-palette',
        schedules: [
            {
                startDate: 'Sun May 10 2020 00:00:00 GMT-0700',
                endDate: 'Wed Jun 10 2020 00:00:00 GMT-0700'
            },
            {
                startDate: 'Sat Jul 11 2020 00:00:00 GMT-0700',
                endDate: 'Tue Aug 11 2020 00:00:00 GMT-0700'
            }
        ]
    },
    {
        subject: 'literature',
        icon: 'fas fa-book',
        schedules: [
            {
                startDate: 'Sat Jul 11 2020 00:00:00 GMT-0700',
                endDate: 'Sun Oct 11 2020 00:00:00 GMT-0700'
            }
        ]
    },
    {
        subject: 'music',
        icon: 'fas fa-music',
        schedules: [
            {
                startDate: 'Tue Jun 09 2020 00:00:00 GMT-0700',
                endDate: 'Thu Jul 09 2020 00:00:00 GMT-0700'
            },
            {
                startDate: 'Sun Aug 09 2020 00:00:00 GMT-0700',
                endDate: 'Wed Sep 09 2020 00:00:00 GMT-0700'
            }
        ]
    }
];

const months = [
    "January", "February", "March", "April",
    "May", "June", "July", "August", 
    "September", "October", "November", "December"
];

const DATA = {
    getRegistrationFormData() {
        // Convert study area select boxes to array
        const studyAreas = $('#areas .input').map(function() {
            const $select = $(this); 
            return { 
                name: $select.attr('name'),
                value: $select.val() 
            }
        });

        // Registration form input values
        return {
            fullName: $('#fullName').val(),
            email: $('#email').val(),
            birthday: $('#birthday').val(),
            schedules: studyAreas.toArray()
        };
    },
    validateFullName() {
        const $fullNameInput = $('#fullName');
        const hasTwoNames = $fullNameInput.val().split(' ').length > 1;
        
        if (!hasTwoNames) {
            UI.renderFullNameError($fullNameInput, 'Please include your first and last name.')
        }

        return hasTwoNames;
    },
    validateScheduleInputs() {
        const $scheduleInputs = $('#areas .input');
        let passed = true;
        let isEmpty = true;
        $scheduleInputs.each(function() {
            if ($(this).val()) {
                isEmpty = false;
            }
        });

        if (isEmpty) {
            passed = false;
            $('#areas').siblings('.error-message').text('Please choose at least one area of study.');
            return passed;
        }

        $scheduleInputs.each(function() {
            // Get selected schedule start and end date
            const $currentInput = $(this);
            const currentInputDateStringArr = $currentInput.val().split(' - ')
            const currentInputDatesArr = currentInputDateStringArr.map(date => new Date(date));
            const [currentInputStartDate, currentInputEndDate] = currentInputDatesArr;

            // Loop through all other selected schedules
            $scheduleInputs.each(function() {
                const $input = $(this);
                if (!$currentInput.is($input)) {
                    // Get selected schedule start and end date
                    const inputDateStringArr = $input.val().split(' - ')
                    const inputDatesArr = inputDateStringArr.map(date => new Date(date));
                    const [inputStartDate, inputEndDate] = inputDatesArr;

                    // Determine if schedules are conflicting
                    // (You cannot take 2 classes that are in the same date range)
                    const startDateConflict = currentInputStartDate >= inputStartDate && currentInputStartDate <= inputEndDate;
                    const endDateConflict = currentInputEndDate >= inputStartDate && currentInputEndDate <= inputEndDate;

                    if (startDateConflict || endDateConflict) {
                        passed = false;

                        // Show errors
                        UI.renderScheduleError($currentInput);
                        UI.renderScheduleError($input);
                        $('#areas').siblings('.error-message').text('You cannot take 2 classes that are in the same date range.');
                    }
                }
            })
        })

        return passed;
    },
    formatConfirmationFormJSON($form) {
        const formData = $form.serializeArray();

        let json = {
            areas: {}
        };

        formData.forEach(function(input) {
            const userFields = ['fullName', 'email', 'birthday'];
            if (userFields.includes(input.name)) {
                json[input.name] = input.value;
            } else {
                const [startDate, endDate] = input.value.split(' - ');
                json.areas[input.name] = { startDate, endDate }
            }
        })

        return json;
    }
}

const UI = {
    formatDateRange(range) {
        const dateStringArr = range.split(' - ');
        const dateArr = dateStringArr.map(date => new Date(date));
        const [startDate, endDate] = dateArr;
        const formattedStartDate = `${months[startDate.getUTCMonth()]} ${startDate.getUTCDate()}`
        const formattedEndDate = `${months[endDate.getUTCMonth()]} ${endDate.getUTCDate()}`

        return `${formattedStartDate} - ${formattedEndDate}`;
    },
    renderAreasOfStudy() {
        const self = this;
        // Destination for "area" components
        const $areas = $('#areas');

        areasOfStudy.forEach(function(area) {
            const $areaDiv = $('<div>');
            const $areaHeader = $('<header>');
            const $areaIcon = $('<i>');
            const $areaSelect = $('<select>');
            const $areaDefaultOption = $('<option>');

            // Area container
            $areaDiv.addClass('area');

            // Header
            $areaHeader.text(area.subject);

            // Header icons
            $areaIcon.addClass(`${area.icon} icon`);

            // Select inputs
            $areaSelect
                .addClass('input')
                .attr('name', area.subject)
                .change(function() {
                    const $areas = $('#areas');
                    const $areaSelects = $areas.find('.input');

                    $areaSelects.each(function() {
                        const $select = $(this);
                        // Remove error classes
                        $select.removeClass('error');
                        $select.parent().removeClass('error');
                        // Clear error message
                        $areas.siblings('.error-message').text('');

                        if ($select.val()) {
                            $select.addClass('selected');
                            $select.parent().addClass('selected');
                        } else {
                            $select.removeClass('selected');
                            $select.parent().removeClass('selected');
                        }
                    })
                })

            // Default option for each select box
            $areaDefaultOption
                .val('')
                .text('No schedule chosen');
            $areaSelect.append($areaDefaultOption);

            // Additional options for each select box
            area.schedules.forEach(function(schedule) {
                const $scheduleOption = $('<option>');
                const dateRange = `${schedule.startDate} - ${schedule.endDate}`
                const formattedDateRange = self.formatDateRange(dateRange);

                $scheduleOption.val(dateRange);
                $scheduleOption.text(formattedDateRange);
                $areaSelect.append($scheduleOption);
            });

            // Render study area components
            $areaHeader.prepend($areaIcon);
            $areaDiv.append($areaHeader);
            $areaDiv.append($areaSelect);
            $areas.append($areaDiv)
        })
    },
    renderConfirmationForm() {
        // Registration form
        const $form = $('.form-container');

        // Confirmation form
        const $confirmation = $('.confirmation-container');

        // Destinations for user data input values
        const $fullName = $('#fullNameConfirmation');
        const $email = $('#emailConfirmation');
        const $birthday = $('#birthdayConfirmation');
        const $confirmationAreas = $('#confirmationAreas');

        // Data from registration form inputs
        const registrationFormData = DATA.getRegistrationFormData();

        // Display schedule input values
        registrationFormData.schedules.forEach(function(schedule) {
            if (!schedule.value) {
                return;
            }

            const $formGrid = $('<div>');
            const $formGroup = $('<div>');
            const $label = $('<span>');
            const $value = $('<p>');
            const $input = $('<input>');

            // Confirmation form input container
            $formGrid.addClass('form-grid')
            
            // Confirmation form input group
            $formGroup.addClass('form-group')

            // Study area label
            $label
                .text(schedule.name)
                .addClass('confirmation-label');
            
            // Study area value
            $value
                .text(UI.formatDateRange(schedule.value))
                .addClass('confirmation-value');

            // Confiramtion form input
            $input
                .attr('type', 'hidden')
                .attr('name', schedule.name)
                .val(schedule.value);

            // Render study area confirmation
            $formGroup.append($label);
            $formGroup.append($value);
            $formGroup.append($input);
            $formGrid.append($formGroup);
            $confirmationAreas.append($formGrid);
        });
        
        // Display fullName value
        $fullName.text(registrationFormData.fullName);
        $fullName.siblings('input').val(registrationFormData.fullName);

        // Display email value
        $email.text(registrationFormData.email);
        $email.siblings('input').val(registrationFormData.email);

        // Display birthday value
        const birthday = new Date(registrationFormData.birthday);
        $birthday.text(`${months[birthday.getUTCMonth()]} ${birthday.getUTCDate()}, ${birthday.getUTCFullYear()}`);
        $birthday.siblings('input').val(registrationFormData.birthday);

        // Display confirmation form
        $form.hide();
        $confirmation.show();
    },
    hideConfirmationForm() {
        const $confirmationForm = $('.confirmation-container');
        const $confirmationAreas = $('#confirmationAreas');

        $confirmationAreas.empty();
        $('.output-message').hide();
        $confirmationForm.hide();
    },
    renderFullNameError($input, message) {
        $input.addClass('error');
        $input.siblings('.error-message').text(message);
    },
    renderScheduleError($input) {
        $input.addClass('error');
        $input.removeClass('selected');
        $input.parent().addClass('error');
        $input.parent().removeClass('selected');
    },
    hideError($input) {
        $input.removeClass('error');
        $input.parent().removeClass('error');
        $input.siblings('.error-message').text('')
    }
};


$(function() {
    // EVENTS
    $('#registrationForm').submit(function(event) {
        event.preventDefault();
        const validFullName = DATA.validateFullName();
        const validScheduleInputs = DATA.validateScheduleInputs();

        if (validFullName && validScheduleInputs) {
            UI.renderConfirmationForm();
        }
    });

    $('#confirmationForm').submit(function(event) {
        event.preventDefault();
        $('.output-message').show();
        const json = DATA.formatConfirmationFormJSON($(this));
        console.log(json);
    });

    $('.input').on('input', function() {
        UI.hideError($(this));
    });

    $('#goBack').click(function() {
        UI.hideConfirmationForm();
        $('.form-container').show();
    });

    UI.renderAreasOfStudy();
});