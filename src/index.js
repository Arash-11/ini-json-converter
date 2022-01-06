const inputTextarea = document.querySelector('#input-textarea');
const outputTextarea = document.querySelector('#output-textarea');
const toJsonBtn = document.querySelector('[data-convert-to-json]');
const toIniBtn = document.querySelector('[data-convert-to-ini]');

const example = (
`; last modified 1 April 2001 by John Doe
[owner]
name = John Doe
organization = Acme Widgets Inc.
file = "payroll.dat"`
);

inputTextarea.value = example;


const convertIniToJson = (iniText) => {
  const result = {};
  let section = result;

  // Some OSes seem to use a carriage return character returned by newline so we need to consider \r too.
  iniText.split(/\r?\n/).forEach(line => {
    let match = null;
    // The use of ^ and $ in the conditionals are to make sure the expression matches the whole line and not just part of it. Leaving these out could result in strange behaviours for some inputs.
    if (match = line.match(/^\[(.*)\]$/)) {
      result[match[1]] = {};
      section = result[match[1]];
    } else if (match = line.match(/^(\w+)(\s*)?=(\s*)?(.*)$/)) {
      section[match[1]] = match[4];
    } else if (!(/^\s*([;#].*)?$/).test(line)) {
      // Throw an error if the line is not empty or a comment - i.e. when it's invalid.
      throw new Error(`Line '${line}' is not valid.`);
    }
  });

  return JSON.stringify(result, null, 2);
};


const convertJsonToIni = (jsonObj) => {
  if (!jsonObj) return null;
  const result = [];

  const getKeyValuePairs = (obj) => {
    // To avoid accidentally including a name-value pair inside the wrong section (e.g. including a top-level name-value pair within a section), we'll first go through the keys with non-object values.
    const notObjectKeys = Object.keys(obj).filter(key => typeof obj[key] !== 'object');
    const objectKeys = Object.keys(obj).filter(key => typeof obj[key] === 'object');

    notObjectKeys.forEach(key => {
      result.push(`${key} = ${obj[key]}\n`);
    });

    objectKeys.forEach(key => {
      if (result.length === 0) result.push(`[${key}]\n`);
      else result.push(`\n[${key}]\n`);
      getKeyValuePairs(obj[key]);
    });
  };

  getKeyValuePairs(JSON.parse(jsonObj));

  return result.join('');
};


const displayOutput = (callbackFn) => {
  let outputText;
  try {
    outputText = callbackFn(inputTextarea.value);
    outputTextarea.classList.remove('error');
  } catch(error) {
    outputText = error.message;
    console.error(outputText);
    outputTextarea.classList.add('error');
  } finally {
    outputTextarea.value = outputText;
  }
};


toJsonBtn.addEventListener('click', () => {
  displayOutput(convertIniToJson);
});

toIniBtn.addEventListener('click', () => {
  displayOutput(convertJsonToIni);
});
