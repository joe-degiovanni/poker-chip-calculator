document.getElementById('chipForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const players = parseInt(document.getElementById('players').value, 10);
  const startingMoney = parseInt(document.getElementById('startingMoney').value, 10);
  const smallBlind = parseFloat(document.getElementById('smallBlind').value);
  const bigBlind = smallBlind * 2;



  const chipCounts = {
    white: parseInt(document.getElementById('white').value, 10),
    blue: parseInt(document.getElementById('blue').value, 10),
    red: parseInt(document.getElementById('red').value, 10),
    green: parseInt(document.getElementById('green').value, 10),
    black: parseInt(document.getElementById('black').value, 10),
  };

  // sort colors by chip count in descending order
  const colors = chipCounts ? Object.keys(chipCounts)
    .sort((a, b) => chipCounts[b] - chipCounts[a]) : [];

  // Set chip values based on small blind
  const chipValues = {};
  colors.forEach((color, index) => {
    chipValues[color] = smallBlind * Math.pow(2, index);
  });

  let chipsPerPlayer = {};
  colors.forEach(color => {
    chipsPerPlayer[color] = Math.floor(chipCounts[color] / players);
  });

  let colorValuesPerPlayer = {};
  colors.forEach(color => {
    colorValuesPerPlayer[color] = chipsPerPlayer[color] * chipValues[color];
  });

  let result = `<p>Small Blind: \$${smallBlind}, Big Blind: \$${bigBlind}</p>`;
  for (let p = 1; p <= players; p++) {
    let allocation = {};
    let valueBreakdown = {};
    let moneyLeft = startingMoney;

    colors.forEach(color => {
      let maxChips = Math.min(chipsPerPlayer[color], Math.floor(moneyLeft / chipValues[color]));
      allocation[color] = maxChips;
      valueBreakdown[color] = maxChips * chipValues[color];
      moneyLeft -= valueBreakdown[color];
    });

    let totalValue = Object.values(valueBreakdown).reduce((a, b) => a + b, 0);

    result += `<h3>Player ${p}</h3>
      <ul>
        <li>Black: ${allocation.black} chips (${formatMoney(valueBreakdown.black)} total / ${formatMoney(chipValues.black)} each)</li>
        <li>Green: ${allocation.green} chips (${formatMoney(valueBreakdown.green)} total / ${formatMoney(chipValues.green)} each)</li>
        <li>Red: ${allocation.red} chips (${formatMoney(valueBreakdown.red)} total / ${formatMoney(chipValues.red)} each)</li>
        <li>Blue: ${allocation.blue} chips (${formatMoney(valueBreakdown.blue)} total / ${formatMoney(chipValues.blue)} each)</li>
        <li>White: ${allocation.white} chips (${formatMoney(valueBreakdown.white)} total / ${formatMoney(chipValues.white)} each)</li>
        <li><strong>Total Value: ${formatMoney(totalValue)}</strong></li>
        <li>Unassigned Money: ${formatMoney(moneyLeft)}</li>
      </ul>`;
  }
  document.getElementById('results').innerHTML = result;
});

function formatMoney(value) {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}
