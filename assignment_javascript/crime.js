const readline = require('readline');
const fs = require('fs');

// Change this values to update the program
//------------------------------------------
var minYear = 2001, maxYear = 2016;
var yearPieChart = 2015;
var index=["01A","02","03","04A","05","06","07","09","2","3","5","6","7","9"];
var nonIndex = ["01B","08A","08B","10","11","12","13","14","15","16","17","18","19","20","22","24","26"];
var indexViolent = ["01A","2","3","04A","04B","02","03"];
var indexProperty = ["5","6","7","9","05","06","07","09"];
//------------------------------------------

var counter = 0;
var jsonData=[],jsonData1=[],jsonData2=[],jsonData3=[];
var tempData={};
var isHeader=true;

var years = [];

// First File Counters
var over500Count = [];
var under500Count = [];

// Second File Counters
var arrCount = [];
var nonArrCount = [];

// Third File Counters
var nonIndexCount = 0;
var indexViolentCount = 0;
var indexPropertyCount = 0;
var otherCrimeCount = 0;
var totalCrimeCount = 0;

// File Headers
var header =[];
var head1 = ["Year","Over500","UnderAnd500"];
var head2 = ["Year","Arrested","NotArrested"];
//var head3 = ["Year","TotalCrimes","IndexProperty","IndexViolent","NonIndex","IndexPropertyPercentage","IndexViolentPercentage","NonIndexPercentage"];
var head3 = ["Crime","NumberOfCrime"];

var crimeCat = ["Index Crime related to Property","Index Crime related to Violence","Non-Index Crime"];


// Array Initialisation
for(var i1=minYear;i1<=maxYear;i1++)
{
	years.push(i1);		
}
for(var i1=0;i1<years.length;i1++)
{
	over500Count[i1] = 0;
	under500Count[i1] = 0;
	arrCount[i1] = 0;
	nonArrCount[i1] = 0;
}

// Read CSV File
const rl = readline.createInterface
({
	input: fs.createReadStream('CSV_file/Crimes_-_2001_to_present_org.csv')
});


// Function to ready data for File 1 and File 2
function readForFile1And2(lineRecords)
{
	// Condition for File 1 - Theft
	if(lineRecords[priIndex] == 'THEFT')
	{
		if(lineRecords[descIndex] == 'OVER $500')
		{
			var currYear = parseInt(lineRecords[yearIndex]);
			over500Count[currYear - minYear] = over500Count[currYear - minYear] + 1;						
		}
		else if(lineRecords[descIndex] == '$500 AND UNDER')
		{
			var currYear = parseInt(lineRecords[yearIndex]);
			under500Count[currYear - minYear] = under500Count[currYear - minYear] + 1;			
		}		
	}
	// Condition for File 2 - Assault
	else if(lineRecords[priIndex] == 'ASSAULT')
	{		
		if(lineRecords[arrestIndex] == 'true')
		{
			var currYear = parseInt(lineRecords[yearIndex]);
			arrCount[currYear - minYear] = arrCount[currYear - minYear] + 1;		

		}
		else if(lineRecords[arrestIndex] == 'false')
		{
			var currYear = parseInt(lineRecords[yearIndex]);
			nonArrCount[currYear - minYear] = nonArrCount[currYear - minYear] + 1;			
		}

	}
}


// Function to ready data for File 3
function readForFile3(lineRecords)
{
	if(lineRecords[yearIndex] == yearPieChart)
	{
		var found = 0;
		totalCrimeCount++;
		var fbiRecord = lineRecords[fbiCodeIndex];
		
		for(var l1=0;l1<nonIndex.length;l1++)
		{
			if(nonIndex[l1] == fbiRecord)
			{
				nonIndexCount = nonIndexCount + 1;
				found = 1;
				break;
			}
			if(l1<indexViolent.length)
			{
				if(indexViolent[l1] == fbiRecord)
				{
					indexViolentCount = indexViolentCount + 1;
					found = 1;
					break;
				}
			}
			if(l1<indexProperty.length)
			{
				if(indexProperty[l1] == fbiRecord)
				{	
					indexPropertyCount = indexPropertyCount + 1;
					found = 1;
					break;
				}
			}
		}

		if ( found == 0 )
		{
			otherCrimeCount = otherCrimeCount + 1;
			console.log("Error Finding : " + fbiRecord);
		}
	}
}

// Reading the first row as Header
function getHeaderData(lineRecords)
{
	lineRecords.forEach(getHeaderLoop);
	function getHeaderLoop(lineRecords,i)
	{		      
        header[i]=lineRecords;
        if (lineRecords == "Primary Type")
        {
        	priIndex = i;
        }
        else if(lineRecords == "Description")
        {
        	descIndex = i;
        }
        else if(lineRecords == "Year")
        {
        	yearIndex = i;
        }
        else if(lineRecords == "Arrest")
        {
        	arrestIndex = i;
        }	         
        else if(lineRecords == "FBI Code")
        {
        	fbiCodeIndex = i;
        }
	}	
}

// Write File 1 after reading the CSV file
function writeTheft()
{
	years.forEach(yearLoop);
	function yearLoop(year,i1)
	{
		var recrd = [year,under500Count[i1],over500Count[i1]]
		for(var j1=0;j1<recrd.length;j1++)
		{			
			tempData[head1[j1]]=recrd[j1];				
		}

		writeFile("JSON_File/theft.json");		
	}
	return i1;
}

// Write File 2 after reading the CSV file
function writeAssault()
{
	jsonData = [];
	years.forEach(yearLoop);
	function yearLoop(year,i1)
	{
		var recrd = [year,arrCount[i1],nonArrCount[i1]]
		for(var j1=0;j1<recrd.length;j1++)
		{			
			tempData[head2[j1]]=recrd[j1];				
		}

		writeFile("JSON_File/assault.json");
	}
	return i1;
}

// Write File 3 after reading the CSV file
function writeCrimecategory()
{
	jsonData = [];

	var crimeCount = [indexPropertyCount,indexViolentCount,nonIndexCount];
	crimeCat.forEach(crimeLoop);
	function crimeLoop(crim,i1)
	{
		var recrd = [crim,crimeCount[i1]];
		recrd.forEach(recrdLoop);
		function recrdLoop(recrd,j1)
		{			
			tempData[head3[j1]]=recrd;				
		}
		
		writeFile("JSON_File/crimeCategory.json");
	}
	return i1;
}

function writeFile(fileName)
{
	jsonData.push(tempData);

	tempData={};

	fs.writeFileSync(fileName,JSON.stringify(jsonData),encoding="utf8");	
}


// Calls when one line is Read
rl.on('line', function(line)
{
	counter = counter + 1;
	var lineRecords = [];
	//console.log("\nProcessing Line " + counter);
	
	var lineRecords = line.trim().split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
	
	if(isHeader)
	{
		getHeaderData(lineRecords);
		isHeader = false;
	}
	
	// First and Second Condition
	//-----------------------------------------
		
	readForFile1And2(lineRecords);

	// Third Condition
	//-----------------------------------------

	readForFile3(lineRecords);
	
});

//--------------------------------------------- After EOF ---------------------------------------------------------
// Call after reading the file

rl.on('close', function()
{
	console.log("\n--------------------------------------------------------------------------------");
	console.log("File Read Successful...Total Lines : " + counter + "\n");
	//-----------------------------------------------------------------------
	// First File
	//-----------------------------------------------------------------------
	console.log("Preparing to write File 1");
	i1 = writeTheft();
	console.log("File 1 with " + i1 + " Records created successfully\n");

	//-----------------------------------------------------------------------
	// Second File
	//-----------------------------------------------------------------------
	console.log("Preparing to write File 2");
	i2=writeAssault();
	console.log("File 2 with " + i2 + " Records created successfully\n");

	//-----------------------------------------------------------------------
	// Third File
	//-----------------------------------------------------------------------
	console.log("Preparing to write File 3");
	i3=writeCrimecategory();
	console.log("File 3 with " + i3 +" Record created successfully\n");
});