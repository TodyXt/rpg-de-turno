// --- SISTEMA DE LOJA ADAPTADO POR CLASSE ---
function openShop() {
    changeScreen('shop'); // Vai para a tela da loja
    const potionPrice = 30 + (zonaAtual * 5);
    logMessage(`[MERCADOR] Poção Pequena custa ${potionPrice} Ouro.`);

    // Itens por classe
    let classItems = '';
    if (player.class === 'GUERREIRO') {
        classItems = `
            <button onclick="buyItem('Espada de Ferro', 50, 'ATK', 5)">Espada de Ferro (+5 ATK) - 50 Ouro</button>
            <button onclick="buyItem('Armadura de Couro', 40, 'DEF', 5)">Armadura de Couro (+5 DEF) - 40 Ouro</button>
        `;
    } else if (player.class === 'MAGO') {
        classItems = `
            <button onclick="buyItem('Cajado Arcano', 50, 'ATK', 5)">Cajado Arcano (+5 ATK) - 50 Ouro</button>
            <button onclick="buyItem('Manto de Magia', 40, 'DEF', 5)">Manto de Magia (+5 DEF) - 40 Ouro</button>
        `;
    } else if (player.class === 'ARQUEIRO') {
        classItems = `
            <button onclick="buyItem('Arco Longo', 50, 'ATK', 5)">Arco Longo (+5 ATK) - 50 Ouro</button>
            <button onclick="buyItem('Cota de Couro', 40, 'DEF', 5)">Cota de Couro (+5 DEF) - 40 Ouro</button>
        `;
    }

    const shopHtml = `
        <p>Seu Ouro: <span id="player-gold-shop">${player.gold}</span></p>
        <button onclick="buyItem('Poção Pequena', ${potionPrice})">Poção Pequena (${potionPrice} Ouro)</button>
        ${classItems}
        <br><br>
        <button onclick="changeScreen('main')">VOLTAR AO MENU</button>
    `;
    document.getElementById('shop-area').innerHTML = shopHtml;
    updateStats();
}

// Função de compra adaptada
function buyItem(itemName, price, statType = null, statValue = 0) {
    if (player.gold >= price) {
        player.gold -= price;
        logMessage(`[COMPRA] Você comprou ${itemName.toUpperCase()}!`);

        // Aplicar efeito do item
        if (statType === 'ATK') {
            player.attack += statValue;
            logMessage(`[STATUS] +${statValue} ATK!`);
        } else if (statType === 'DEF') {
            player.defense += statValue;
            logMessage(`[STATUS] +${statValue} DEF!`);
        } else if (itemName.toLowerCase().includes('poção')) {
            player.potions++;
            logMessage(`[INVENTÁRIO] Poção adicionada!`);
        }

    } else {
        logMessage(`[ERRO] Ouro insuficiente para comprar ${itemName}.`);
    }

    updateStats();
    openShop(); // Atualiza a loja após compra
}
