This is question portal specifically designed for CAT Exams but it is exam agnostic. It is not dependednt on exclusively on CAT exams it can be used for any exams and can also be intgrated with other competitive examination becuase it covers displaying of questions and review of questions and displaying graphs based on right and wrong selected answers and also most of Frontend logic is written based on question selection by logic I mean state management and tracking is based on wether selection was write or wrong to track time taken if backend changes then behanviour of this codebase will be same and requires little change so basically it is made by keeping one thing in mind if changes required we just Plug that in and code is still functional. All we require from bacekend is array of MCQs and then it start working with all logic intact. Here are some screenshots attached and explanation of screens.


<h2>Screen 1:</h2><br>
Below image shows how questions appear on the scrren and how much we answered and not answered shows on display

<img src ='./Screenshot 2026-05-09 191341.png'/>
<br/>

<h2>Screen 2: </h2><br>
This screen offers result page how result should be displayed on the scrren along with answer selected it will give more details if it have solution or wrong answer then it shows whats right answer and all. It is question-wise.

<img src ='./Screenshot 2026-05-09 191929.png'> <br/>
<img src='Screenshot 2026-05-09 191937.png'/>
<h2>Screen 3:</h2>
<br>
Here this screen offers Data Analysis and to show student how much time he/she took to solve particular problem and also overall time taken by them.
<img src='Screenshot 2026-05-09 191943.png'/>


<h2>Screen 4:</h2>
<br>
This is section wise Graphical representation of how many correct and incorrect attempts were made along with percentage count and also it is for CAT specific exam so it have one more fields of Percentile which have separate implementation becuase it counts based on all students who have given this exam. It can be removed where not needed.
<img src='Screenshot 2026-05-09 191949.png
'/>
