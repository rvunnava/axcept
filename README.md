
<img src="https://github.com/rvunnava/axcept/raw/master/images/axcept.png" alt="axcept">


<h1> What is axcept? </h1>
axcept is a high-automation Behavior-driven development tool that provides a shared process for Software developers, Business Analysts and QA Teams to collaborate on software development, with the aim of delivering "software that matters". 

It uses keywords with parameters (or test clauses) to describe the software behavior in a way that will also be understood by developers and thus make the requirements documents directly executable as a collection of tests.

Learn More about Behavior-driven Development in agile projects <br/>
<a href="http://en.wikipedia.org/wiki/Behavior-driven_development">Wikepedia</a> <br/>
<a href="http://dannorth.net/introducing-bdd/">dannorth.net</a>


<h3>Features:</h3>
axcept currently only suports database tests. 
Following are the list of databases tested and can work with axcept. 
<ul>
  <li>MS Sql Server</li>
  <li>Oracle</li>
  <li>DB2</li>
  <li>My Sql</li>
</ul>
** axcept is an extensible system and may work with any databases that are not listed above.

<h3>Roadmap:</h3>
axcept is a new open source project started on December 2013 with main objective of making requirements directly executable as a collection of tests or test clauses.  <br/>

axcept currently only support database tests, and many BDD related tool features are currently under development. 
The next six month goal of this tool is to have a free form word like editor where tests can be written in form of keywords or test clauses, and validate variety of documents like xml's, pdf's and run tests against API written in C#. <br/><br/>
Following are the list of tickets created to detail each feature mentioned in the Road map.
<ul>
  <li>Word like editor to write user stories, behavioral requirements and comments <a href="https://github.com/rvunnava/axcept/issues/1"> Ticket #1 </a></li>
  <li>Define test fixtures and assign a test clause with required parameters 
  <a href="https://github.com/rvunnava/axcept/issues/7"> Ticket #7, </a>
  <a href="https://github.com/rvunnava/axcept/issues/8"> Ticket #8 </a></li>
  <li>xml validations <a href="https://github.com/rvunnava/axcept/issues/9"> Ticket #9 </a></li>
  <li>.net runner <a href="https://github.com/rvunnava/axcept/issues/10"> Ticket #10 </a></li>
  <li>pdf validations <a href="https://github.com/rvunnava/axcept/issues/11"> Ticket #11 </a></li>
</ul>

<h1>User Guide</h1>
<h3> Setup & Installation</h3>
<ol>
  <li>Download latest version of axcept</li>
  <li>Unzip folder to your hard drive</li>
  <li>Point IIS to the folder that is holding the axcept documents.<br/> For more details on setting up IIS <a href="http://support.microsoft.com/kb/323972">Click here </a></li>
  <li>To Test if IIS is properly setup, on the same computer/server IIS is started type <font color="red"> localhost:[port given during setup]/testgrid.aspx </font> <br/> (If site did not open, there is some issue with the IIS Setup. Please go back to IIS set up instructions) 
  </li>
  <li>To Open axcept from different computer: Type in the computer name used above <br/> [Computer Name]:[Port Number]/testgrid.aspx</li>
</ol>

<h3>Working with axcept</h3>
<h4>Database Testing</h4>
<table width="400px">
<tr>
  <td align="left"><b>Creating New Test Pages</b></td>
  <td align="center">
    <a href="https://github.com/rvunnava/axcept-documentation/raw/master/ppt/CreateNewTest.ppsx">Click here</a></td>
</tr>

<tr>
  <td align="left"><b>Editing axcept Pages</b>
  <ul>
    <li>Enter Comments</li>
    <li>Write sql queries</li>
    <li>Build Expected Results</li>
  </ul>
  </td>
  <td align="center">
    <a href="https://github.com/rvunnava/axcept-documentation/raw/master/ppt/EditTest.ppsx">Click here</a></td>
</tr>

<tr>
  <td align="left"><b>Implement the tests</b>
  <ul>
    <li>Page Types</li>
    <li>Connecting to Database</li>
    <li>Page Variables</li>
    <li>Key vs Non key columns</li>
  </ul>
  </td>
  <td align="center">
    <a href="https://github.com/rvunnava/axcept-documentation/raw/master/ppt/ImplimentTests.ppsx">Click here</a></td>
</tr>

<tr>
  <td align="left" width="550"><b>Running tests</b>
  <ul>
    <li>Running from UI</li>
    <li>Running from command prompt</li>
  </ul>
  <b>Results History</b>
  <ul>
    <li>Test Results</li>
    <li>Suite Results</li>
  </ul>
  
  
  </td>
  <td width="120" align="center">
    <a href="https://github.com/rvunnava/axcept-documentation/raw/master/ppt/RunningTests.ppsx">Click here</a></td>
</tr>

<tr>
  <td align="left"><b>Miscellaneous Features</b>
  <ul>
    <li>New data snapshot</li>
    <li>Custom function for sql queries</li>
  </ul>
  
  </td>
  <td align="center">
    <a href="https://github.com/rvunnava/axcept-documentation/raw/master/ppt/MiscFeatures.ppsx">Click here</a></td>
</tr>

</table>



