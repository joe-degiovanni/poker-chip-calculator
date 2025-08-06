const colors = localStorage.getItem('chipColors') ? JSON.parse(localStorage.getItem('chipColors')) : [];
if (colors.length === 0) {
  // initialize with default colors if none are set
  colors.push("white", "blue", "red", "green", "black");
  localStorage.setItem('chipColors', JSON.stringify(colors))
}

const chipCounts = localStorage.getItem('chipCounts') ? JSON.parse(localStorage.getItem('chipCounts')) : {};
if (Object.keys(chipCounts).length === 0) {
  // initialize with default counts if none are set
  colors.forEach(color => chipCounts[color] = 50);
  localStorage.setItem('chipCounts', JSON.stringify(chipCounts));
}

// sort colors by their chip counts (highest to lowest)
colors.sort((a, b) => (chipCounts[b] || 0) - (chipCounts[a] || 0));


function buildChipColorCountInputs() {
  const container = document.getElementById('chipColorCounts');
  container.innerHTML = ''; // Clear existing inputs
  colors.forEach(color => {
    // Create label and input for each color
    const label = document.createElement('label');
    label.htmlFor = `count-${color}`;
    label.textContent = color.charAt(0).toUpperCase() + color.slice(1);
    label.style.color = color; // Set label color to match chip color
    label.style.fontWeight = 'bold';
    label.style.textShadow = '1px 1px 2px rgba(0, 0, 0, 0.5)';

    // create input element
    const input = document.createElement('input');
    input.type = 'number';
    input.id = `count-${color}`;
    input.value = chipCounts[color];
    input.min = 0;
    input.placeholder = `${color.charAt(0).toUpperCase() + color.slice(1)} Count`;
    input.addEventListener('change', function () {
      chipCounts[color] = parseInt(this.value, 10);
      localStorage.setItem('chipCounts', JSON.stringify(chipCounts));
    });

    // Append label and input to the container
    container.appendChild(label);
    container.appendChild(input);

    // create a delete color button
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.style.marginLeft = '10px';
    deleteButton.addEventListener('click', function () {
      const index = colors.indexOf(color);
      if (index > -1) {
        colors.splice(index, 1);
        delete chipCounts[color];
        localStorage.setItem('chipColors', JSON.stringify(colors));
        localStorage.setItem('chipCounts', JSON.stringify(chipCounts));
        buildChipColorCountInputs(); // Rebuild inputs after deletion
      }
    });
    container.appendChild(deleteButton);
  });
}

buildChipColorCountInputs();

function addNewColor() {
  const newColor = document.getElementById('newColor').value.trim().toLowerCase();
  if (newColor && !colors.includes(newColor)) {
    colors.push(newColor);
    chipCounts[newColor] = 50; // Default count for new color
    localStorage.setItem('chipColors', JSON.stringify(colors));
    localStorage.setItem('chipCounts', JSON.stringify(chipCounts));
    buildChipColorCountInputs();
    document.getElementById('newColor').value = ''; // Clear input field
  }
}

document.getElementById('addColorButton').addEventListener('click', addNewColor);

document.getElementById('chipForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const players = parseInt(document.getElementById('players').value, 10);
  const startingMoney = parseInt(document.getElementById('startingMoney').value, 10);
  const smallBlind = parseFloat(document.getElementById('smallBlind').value);
  const bigBlind = smallBlind * 2;


  // Set chip values based on small blind
  const chipValues = {};
  colors.forEach((color, index) => {
    if (index === 0) {
      chipValues[color] = smallBlind;
    } else {
      let val = chipValues[colors[index - 1]] * Math.min(index + 1, 5);
      chipValues[color] = val > 1 ? Math.round(val) : val;
    }
  });

  let chipsPerPlayer = {};
  colors.forEach(color => {
    chipsPerPlayer[color] = Math.floor(chipCounts[color] / players);
  });


  let result = `<p>Small Blind: ${formatMoney(smallBlind)}, Big Blind: ${formatMoney(bigBlind)}</p>`;
  result += `<p>Chip Values:</p><ul>`;
  colors.forEach(color => {
    result += `<li>
        ${color.charAt(0).toUpperCase() + color.slice(1)}: ${formatMoney(chipValues[color])} each
        </li>`;
  });
  result += `</ul>`;
  document.getElementById('results').innerHTML = result;

  let suggestedDenominations = 'Suggested Chip Denominations (based on small blind): ';
  suggestedDenominations += colors.map(color => `${color.charAt(0).toUpperCase() + color.slice(1)}: ${formatMoney(chipValues[color])}`).join(', ');
  document.getElementById('suggested-chip-denominations').innerHTML = suggestedDenominations

  let suggestedChipDistribution = 'Suggested Chip Distribution per Player: <ul>';
  suggestedChipDistribution += colors.map(color => `<li>
    ${color.charAt(0).toUpperCase() + color.slice(1)}: ${chipsPerPlayer[color]} chips worth ${formatMoney(chipValues[color])} each (total: ${formatMoney(chipsPerPlayer[color] * chipValues[color])})
    </li>`).join('\n');
  suggestedChipDistribution += `<li>Total Money per Player: ${formatMoney(totalMoneyPerPlayer)}</li></ul>`;
  document.getElementById('suggested-starting-chip-distribution').innerHTML = suggestedChipDistribution;
});

function formatMoney(value) {
  return value.toLocaleString('en-US', {style: 'currency', currency: 'USD'});
}
