import Papa from 'papaparse';
export const handleCSVUpload = async (event, setInterviewers, setInvalidValues, showAlert) => {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = async e => {
    const contents = e.target.result;
    const newInvalidValues = []; // Use a temporary array to store invalid values

    // Use Papaparse to parse the CSV file
    Papa.parse(contents, {
      delimiter: ',', // Set the appropriate delimiter
      header: true, // Specify if the first row is a header (containing column names)
      dynamicTyping: true, // Attempt to automatically detect data types
      complete: result => {
        // 'result.data' contains the parsed data from the CSV
        const allValues = [];

        // Iterate through each row of the CSV
        result.data.forEach(row => {
          // Iterate through each column of the row
          Object.keys(row).forEach(columnName => {
            const value = row[columnName];
            if (value !== null && typeof value === 'string' && value.trim().length === 6) {
              allValues.push(value.trim().toUpperCase());
            } else {
              if (value !== null) {
                newInvalidValues.push(value); // Store invalid values
              }
            }
          });
        });

        // Update the 'interviewers' state with valid values
        setInterviewers(allValues.map((value, index) => ({ id: value, index })));
        // Update the 'invalidValues' state with invalid values
        setInvalidValues(newInvalidValues);

        // Show the alert with the message including invalidValues
        if (newInvalidValues.length > 0) {
          showAlert(
            `The following elements were not considered (expected: 6 uppercase characters): ${newInvalidValues.join(
              ', '
            )}`,
            'warning'
          );
        }
      },
      error: error => {
        showAlert(`Erreur lors de l'analyse du fichier CSV : ${error.message}`, 'error');
        console.error('Error parsing the CSV file:', error.message);
      },
    });
  };

  reader.readAsText(file);
};
