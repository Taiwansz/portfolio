// cryptovision.js

document.addEventListener('DOMContentLoaded', () => {
    let portfolioChartInstance = null;

    // Elements
    const totalValueEl = document.getElementById('total-portfolio-value');
    const portfolioListEl = document.getElementById('portfolio-items-container');
    const addHoldingForm = document.getElementById('add-holding-form');
    const chartCanvas = document.getElementById('portfolioChart');

    // Formatter for USD
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    // Fetch and render portfolio
    async function fetchAndRenderPortfolio() {
        try {
            // 1. Fetch portfolio items
            const response = await fetch('/api/portfolio');
            if (!response.ok) throw new Error('Failed to fetch portfolio');
            const portfolio = await response.json();

            if (portfolio.length === 0) {
                if (totalValueEl) totalValueEl.textContent = '$0.00';
                if (portfolioListEl) portfolioListEl.innerHTML = '<p style="color:#a0a0a0; padding:20px;">No assets found. Add some above!</p>';
                updateChart([], []);
                return;
            }

            // 2. Extract coin_ids and fetch live prices
            const coinIds = [...new Set(portfolio.map(item => item.coin_id))].join(',');
            const cgResponse = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd`);
            if (!cgResponse.ok) throw new Error('Failed to fetch prices from CoinGecko');
            const prices = await cgResponse.json();

            // 3. Calculate total value and update UI
            let totalValue = 0;
            const labels = [];
            const chartData = [];
            
            // Map to accumulate values per coin for the chart
            const coinValues = {};

            if (portfolioListEl) {
                portfolioListEl.innerHTML = ''; // Clear current list
            }

            portfolio.forEach(item => {
                const coinId = item.coin_id;
                const price = prices[coinId] ? prices[coinId].usd : 0;
                const currentValue = price * item.amount;
                totalValue += currentValue;

                if (!coinValues[coinId]) coinValues[coinId] = 0;
                coinValues[coinId] += currentValue;

                // Profit/loss calculation
                const costBasis = item.buy_price * item.amount;
                const profitLoss = currentValue - costBasis;
                const profitLossPercent = costBasis > 0 ? (profitLoss / costBasis) * 100 : 0;
                const isPositive = profitLoss >= 0;

                // Create card item
                if (portfolioListEl) {
                    const card = document.createElement('div');
                    card.className = 'glass-card';
                    card.innerHTML = `
                        <div class="card-header">
                            <div class="coin-info">
                                <div class="coin-name-symbol">
                                    <span class="coin-name">${coinId.charAt(0).toUpperCase() + coinId.slice(1)}</span>
                                    <span class="coin-symbol">${coinId.substring(0, 4).toUpperCase()}</span>
                                </div>
                            </div>
                            <span class="holding-amount">${item.amount} coins</span>
                        </div>
                        <div class="card-body">
                            <span class="current-value">${formatter.format(currentValue)}</span>
                            <span class="profit-loss ${isPositive ? 'positive' : 'negative'}">
                                ${isPositive ? '▲' : '▼'} ${formatter.format(Math.abs(profitLoss))} (${Math.abs(profitLossPercent).toFixed(2)}%)
                            </span>
                        </div>
                        <div class="card-footer">
                            <span>Buy: ${formatter.format(item.buy_price)}</span>
                            <button class="delete-btn" data-id="${item.id}">Delete</button>
                        </div>
                    `;
                    portfolioListEl.appendChild(card);
                }
            });

            if (totalValueEl) {
                totalValueEl.textContent = formatter.format(totalValue);
            }

            // Prepare chart data
            for (const [coin, val] of Object.entries(coinValues)) {
                labels.push(coin.charAt(0).toUpperCase() + coin.slice(1));
                chartData.push(val);
            }

            // 5. Plot the portfolio distribution
            updateChart(labels, chartData);

            // Attach delete listeners
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const btnEl = e.target.closest('.delete-btn');
                    const id = btnEl.getAttribute('data-id');
                    await deleteHolding(id);
                });
            });

        } catch (error) {
            console.error('Error fetching portfolio:', error);
        }
    }

    // 4. Handle form submission
    if (addHoldingForm) {
        addHoldingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = addHoldingForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Adding...';
            submitBtn.disabled = true;

            const coinInput = document.getElementById('coin_id');
            const amountInput = document.getElementById('amount');
            const buyPriceInput = document.getElementById('buy_price');
            
            const coin_id = coinInput ? coinInput.value.trim().toLowerCase() : '';
            const amount = amountInput ? parseFloat(amountInput.value) : 0;
            const buy_price = buyPriceInput ? parseFloat(buyPriceInput.value) : 0;

            try {
                const response = await fetch('/api/portfolio', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ coin_id, amount, buy_price })
                });

                if (response.ok) {
                    addHoldingForm.reset();
                    await fetchAndRenderPortfolio();
                } else {
                    console.error('Failed to add holding');
                }
            } catch (error) {
                console.error('Error adding holding:', error);
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // 6. Delete an item and refresh
    async function deleteHolding(id) {
        try {
            const response = await fetch(`/api/portfolio/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                await fetchAndRenderPortfolio();
            } else {
                console.error('Failed to delete holding');
            }
        } catch (error) {
            console.error('Error deleting holding:', error);
        }
    }

    // Helper to render or update Chart.js
    function updateChart(labels, data) {
        if (!chartCanvas) return;
        
        const ctx = chartCanvas.getContext('2d');
        
        if (portfolioChartInstance) {
            portfolioChartInstance.destroy();
        }

        if (data.length === 0) return;

        portfolioChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Portfolio Distribution',
                    data: data,
                    backgroundColor: [
                        '#4ade80',
                        '#60a5fa',
                        '#f472b6',
                        '#fbbf24',
                        '#a78bfa',
                        '#38bdf8'
                    ],
                    borderColor: '#050505',
                    borderWidth: 2,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: '#ffffff',
                            font: {
                                family: "'Inter', sans-serif",
                                size: 12
                            },
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#a0a0a0',
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderWidth: 1,
                        padding: 12,
                        callbacks: {
                            label: function(context) {
                                return ' ' + formatter.format(context.parsed);
                            }
                        }
                    }
                },
                cutout: '70%'
            }
        });
    }

    // Initial fetch
    fetchAndRenderPortfolio();
});
