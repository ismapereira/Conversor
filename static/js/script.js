// Carregar as moedas disponíveis quando a página carregar
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/currencies');
        const data = await response.json();
        
        if (data.supported_codes) {
            const currencies = data.supported_codes;
            const fromSelect = document.getElementById('fromCurrency');
            const toSelect = document.getElementById('toCurrency');

            // Limpar as opções existentes
            fromSelect.innerHTML = '';
            toSelect.innerHTML = '';

            // Adicionar as opções de moeda
            currencies.forEach(([code, name]) => {
                const option = document.createElement('option');
                option.value = code;
                option.text = `${code} - ${name}`;
                
                fromSelect.appendChild(option.cloneNode(true));
                toSelect.appendChild(option);
            });

            // Definir valores padrão
            fromSelect.value = 'USD';
            toSelect.value = 'BRL';

            // Fazer a primeira conversão
            await convertCurrency();
        }
    } catch (error) {
        console.error('Erro ao carregar moedas:', error);
        showError('Erro ao carregar as moedas disponíveis. Por favor, recarregue a página.');
    }
});

// Função para trocar as moedas de posição
function swapCurrencies() {
    const fromSelect = document.getElementById('fromCurrency');
    const toSelect = document.getElementById('toCurrency');
    
    // Guardar os valores atuais
    const fromValue = fromSelect.value;
    const toValue = toSelect.value;
    
    // Trocar os valores
    fromSelect.value = toValue;
    toSelect.value = fromValue;
    
    // Fazer a conversão com os novos valores
    convertCurrency();
    
    // Adicionar classe para animação
    const swapButton = document.querySelector('.swap-button');
    swapButton.classList.add('rotating');
    setTimeout(() => swapButton.classList.remove('rotating'), 300);
}

// Função principal de conversão
async function convertCurrency() {
    const amount = document.getElementById('amount').value;
    const fromCurrency = document.getElementById('fromCurrency').value;
    const toCurrency = document.getElementById('toCurrency').value;

    if (!amount || amount <= 0) {
        showError('Por favor, insira um valor válido.');
        return;
    }

    try {
        const response = await fetch('/api/convert', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: fromCurrency,
                to: toCurrency,
                amount: amount
            })
        });

        const data = await response.json();

        if (data.conversion_result) {
            updateResult(data, fromCurrency, toCurrency);
        } else {
            throw new Error(data.error || 'Erro na conversão');
        }
    } catch (error) {
        console.error('Erro na conversão:', error);
        showError('Erro ao converter as moedas. Por favor, tente novamente.');
    }
}

// Função para atualizar o resultado na tela
function updateResult(data, fromCurrency, toCurrency) {
    const resultElement = document.getElementById('result');
    const rateElement = document.getElementById('exchangeRate');
    
    // Formatar o resultado com o símbolo da moeda
    const formattedResult = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: toCurrency
    }).format(data.conversion_result);

    // Formatar a taxa de câmbio
    const formattedRate = new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4
    }).format(data.conversion_rate);

    // Atualizar os elementos
    resultElement.textContent = formattedResult;
    rateElement.innerHTML = `<i class="fas fa-chart-line me-2"></i>Taxa de câmbio: 1 ${fromCurrency} = ${formattedRate} ${toCurrency}`;
    
    // Adicionar animação
    resultElement.classList.add('highlight');
    setTimeout(() => resultElement.classList.remove('highlight'), 300);
}

// Função para mostrar erros
function showError(message) {
    alert(message);
}
