import Papa from 'papaparse';

export const handleCSVUpload = async (event, setInterviewers, setInvalidValues, showAlert) => {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = async e => {
    const contents = e.target.result;
    const newInvalidValues = [];
    const uniqueValues = new Set();

    Papa.parse(contents, {
      delimiter: ',',
      header: true,
      dynamicTyping: true,
      complete: result => {
        result.data.forEach(row => {
          Object.keys(row).forEach(columnName => {
            const value = row[columnName];
            if (value !== null && typeof value === 'string' && value.trim().length === 6) {
              const uppercasedValue = value.trim().toUpperCase();
              if (!uniqueValues.has(uppercasedValue)) {
                uniqueValues.add(uppercasedValue);
              }
            } else {
              if (value !== null) {
                newInvalidValues.push(value);
              }
            }
          });
        });

        const uniqueValuesArray = Array.from(uniqueValues);
        setInterviewers(uniqueValuesArray.map((value, index) => ({ id: value, index })));
        setInvalidValues(newInvalidValues);
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
        showAlert(`Error analyzing CSV file : ${error.message}`, 'error');
        console.error('Error parsing the CSV file:', error.message);
      },
    });
  };

  reader.readAsText(file);
};
