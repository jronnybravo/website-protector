
            // let surveyModal = new bootstrap.Modal(document.getElementById('mdl_survey'), {})
            // surveyModal.toggle();

            let questions = [{
                    text: 'What is your gender?',
                    choices: ['Male', 'Female']
                }, {
                    text: 'How old are you?',
                    choices: ['18-29', '30-39', '40-49', '50+']
                }, {
                    text: 'This is another question',
                    choices: ['Answer 1', 'Answer 2', 'Answer 3']
                }, {
                    text: 'Another question here',
                    choices: ['iPhone', 'Android']
                }];

            jQuery(function($) {
                let now = new Date();
                let fewMinutesFromNow = new Date();
                fewMinutesFromNow.setMinutes(now.getMinutes() + 5);

                $("#div_countdown_timer").countdownTimer({
                    dateEnd: fewMinutesFromNow
                });
                
                for (let i = 0; i < questions.length; i++) {
                    let questionSetClone = $("#templates .question-set").clone();
                    questionSetClone.find(".question-text").html(questions[i].text);
                    for(let j = 0; j < questions[i].choices.length; j++) {
                        let questionSetChoiceClone = questionSetClone.find(".question-choice-button").first().clone();
                        questionSetChoiceClone.data('questionindex', i);
                        questionSetChoiceClone.html(questions[i].choices[j]);
                        questionSetChoiceClone.removeClass("visually-hidden")
                        questionSetClone.find(".question-choices").append(questionSetChoiceClone);
                    }
                    $("#div_question_sets").append(questionSetClone);
                }

                $("#div_question_sets .question-set").hide();
                $("#div_question_sets .question-set").first().show();
                $("#div_question_sets .question-choice-button").click(function(){
                    let questionIndex = $(this).data("questionindex");
                    questions[questionIndex].answer = $(this).html();

                    $("#div_question_sets .question-set").hide();
                    let nextQuestion = $(this).parents(".question-set").next();
                    if(nextQuestion.length) {
                        nextQuestion.fadeIn();
                    } else {
                        // console.log(questions);
                        $("#div_countdown_timer").attr("style", "display: none !important");
                        $("#div_game").fadeIn();
                    }
                });
            });
        