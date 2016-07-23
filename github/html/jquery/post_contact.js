$(function(){     



        $('#submitButton').click(function(e){
            e.preventDefault();
            console.log('submit clicked');



            var contact = {};
            contact.name = $('#name').val();
            contact.email = $('#email').val();
            contact.phone = $('#phoneNumber').val();
            contact.subscribe = false;
            contact.message = $("#message").val();
            
            contact.recaptcha = $("#g-recaptcha-response").val();



            if($("input#subscribe").is(":checked")) {
                contact.subscribe = true;
            }
            
                    $.ajaxSetup(
                    {
                        cache: false
                    });
                    
                    $.ajax({
                        type: 'POST',
                        data: contact,
                        dataType: 'json',
                        url: '/process_post',                   
                        success: function(data) {
                            var output; 
                            if (data.message.localeCompare("error") == 0) {
                                console.log("emit failure message");
                                
                                output="<p class=\"alert alert-danger\" > \
                                            <strong>Failed to send message. Please enter a name with valid e-mail or phone and check recaptcha. </strong> \
                                        </p>"
                            }
                            else {
                                console.log('emit success message');
                               
                                output= "<p class=\"alert alert-success\" > \
                                            <strong>Message has received successfully!</strong> Thank you and stay tuned!\
                                        </p>"
                                $('#contactForm').trigger("reset");

                            }

                            $("#resultMessage").html(output);
                            grecaptcha.reset();


                        },
                        error: function(error) {
                            console.log(error);
                        }
                    });


        });             
});