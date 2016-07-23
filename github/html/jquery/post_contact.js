$(function(){               
    $('#submitButton').click(function(e){
        e.preventDefault();
        console.log('submit clicked');

        var data = {};
        data.destination = $('#destination option:selected').val();
        data.passport = $('#passport option:selected').val();
        data.duration = $('#duration option:selected').val();
                    

        $.ajax({
                type: 'POST',
                data: data,
                contentType: 'application/json',
                url: '/process',                   
                success: function(data) {
                            console.log('success');
                            console.log(data);

                            var output, i;
                            var cost = 0;
                            if (data[0] != undefined) {
                                cost = data[0].cost;
                            }

                            output="<ul><li><strong>Application Fee:</strong> "+cost+"</li>"+
                                    "<li><strong>Required Forms:</strong></li>";
                            
                            if (data[0] != undefined) {
                                var forms=data[0]["requiredocs"].split(',');


                            
                                output+="<ul>";
                                forms.map(function(item) {
                                    output=output+"<li>"+item+"</li>";
                                });
                                output+="</ul>";
                                
                            }
                            output+="</ul>";
                            
                            document.getElementById("result").innerHTML=output;
                            



                        }
                    });




                });             
            });