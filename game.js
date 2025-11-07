// --- DADOS E VARIÁVEIS DO JOGO ---

const ZONAS = [
    { nome: "FLORESTA PROIBIDA", lvlMin: 1, inimigos: ["GOBLIN", "SLIME", "LOBO SELVAGEM"], boss: { nome: "REI GOBLIN", sprite: "👑" }, sprite: "🌳" },
    { nome: "CAVERNAS SOMBRIAS", lvlMin: 5, inimigos: ["MORCEGO GIGANTE", "ARANHA VENENOSA", "ESQUELETO"], boss: { nome: "O ABOMINÁVEL", sprite: "💀" }, sprite: "⛰️" },
    { nome: "RUÍNAS ESQUECIDAS", lvlMin: 10, inimigos: ["FANTASMA", "GOLEM DE PEDRA", "MÚMIA"], boss: { nome: "LICH ANTIGO", sprite: "👻" }, sprite: "🏛️" },
    { nome: "MONTANHAS VULCÁNICAS", lvlMin: 15, inimigos: ["SALAMANDRA", "ELEMENTAR DE FOGO", "DRAGÃOZINHO"], boss: { nome: "DRAKE DE LAVA", sprite: "🐉" }, sprite: "🌋" },
    { nome: "CASTELO DO CAOS", lvlMin: 20, inimigos: ["GUARDA NEGRO", "DEMÔNIO MENOR", "VAMPIRO"], boss: { nome: "O TIRANO SUPREMO", sprite: "😈" }, sprite: "🏰" }
];

const BASE_STATS = {
    'GUERREIRO': { hp: 150, atk: 20, def: 10, sprite: '🛡️' },
    'MAGO': { hp: 100, atk: 25, def: 5, sprite: '🔮' },
    'ARQUEIRO': { hp: 110, atk: 22, def: 7, sprite: '🏹' }
};

let player;
let currentEnemy;
let isAnimating = false;
let zonaAtual = 0;

// --- CLASSE JOGADOR e INIMIGO ---

class Player {
    constructor(name, className) {
        const stats = BASE_STATS[className];
        this.name = name;
        this.class = className;
        this.lvl = 1;
        this.hp = stats.hp;
        this.hpMax = stats.hp;
        this.attack = stats.atk;
        this.defense = stats.def;
        this.exp = 0;
        this.expToNextLvl = 100;
        this.gold = 50;
        this.potions = 2;
        this.sprite = stats.sprite;
        this.statPoints = 0;
    }

    levelUp() {
        this.lvl++;
        this.exp -= this.expToNextLvl;
        this.expToNextLvl = Math.floor(this.expToNextLvl * 1.5);
        this.statPoints += 5;
        this.hpMax += 10;
        this.hp = this.hpMax;
        logMessage(`[LVL UP] VOCÊ ALCANÇOU O NÍVEL ${this.lvl}! PONTOS GANHOS.`);
        if (!currentEnemy) changeScreen('stats'); 
    }
}

class Enemy {
    constructor(lvl, isBoss = false) {
        const zona = ZONAS[zonaAtual];
        let name, hpBase, atkBase, sprite;

        if (isBoss) {
            name = zona.boss.nome;
            hpBase = 50 + (lvl * 30);
            atkBase = 15 + (lvl * 8);
            sprite = zona.boss.sprite;
        } else {
            name = zona.inimigos[Math.floor(Math.random() * zona.inimigos.length)];
            hpBase = 30 + (lvl * 18);
            atkBase = 10 + (lvl * 4);
            sprite = '👹';
        }

        this.name = name;
        this.lvl = lvl;
        this.hp = hpBase;
        this.attack = atkBase;
        this.defense = 3 + lvl;
        this.expReward = (isBoss ? 200 : 60) + (lvl * (isBoss ? 40 : 20));
        this.goldReward = Math.floor(Math.random() * (isBoss ? 50 : 15) * lvl) + 10;
        this.isBoss = isBoss;
        this.sprite = sprite;
        this.initialHp = hpBase;
    }
}

// --- GERENCIAMENTO DE TELAS ---

function changeScreen(screenId) {
    const screens = document.querySelectorAll('.game-screen');
    screens.forEach(screen => screen.classList.remove('active-screen'));
    const targetScreen = document.getElementById(`screen-${screenId}`);
    if (targetScreen) targetScreen.classList.add('active-screen');
}

// --- FUNÇÕES DE INTERFACE ---

function updateStats() {
    if (!player) return;

    const statsHtml = `
        <p>ZONA: ${ZONAS[zonaAtual].sprite} ${ZONAS[zonaAtual].nome} | NÍVEL: ${player.lvl} (PONTOS: ${player.statPoints})</p>
        <p>NOME: ${player.name} | CLASSE: ${player.class} | OURO: ${player.gold} | POÇÕES: ${player.potions}</p>
        <p>HP: ${Math.max(0, player.hp)}/${player.hpMax} | ATK: ${player.attack} | DEF: ${player.defense} | EXP: ${player.exp}/${player.expToNextLvl}</p>
    `;
    
    document.getElementById('player-stats').innerHTML = `<h2>STATUS GERAL</h2>${statsHtml}`;
    document.getElementById('player-stats-summary').innerHTML = statsHtml;
    document.getElementById('player-gold-shop').textContent = player.gold;

    const heroHpPercent = (player.hp / player.hpMax) * 100;
    document.getElementById('hero-hp-bar').style.width = heroHpPercent + '%';
    document.getElementById('hero-name-display').textContent = player.name;
    document.getElementById('hero-sprite').textContent = player.sprite;
    document.getElementById('player-lvl-hud').textContent = player.lvl;
    document.getElementById('player-hp-hud').textContent = Math.max(0, player.hp);
    document.getElementById('player-hp-max-hud').textContent = player.hpMax;

    const hudEnemy = document.getElementById('hud-enemy');
    const enemyModel = document.getElementById('enemy-model');
    
    if (currentEnemy) {
        hudEnemy.classList.remove('hidden-enemy-hud');
        enemyModel.classList.remove('hidden-enemy');
        enemyModel.classList.add('monster-appeared'); 
        const enemyHpPercent = (currentEnemy.hp / currentEnemy.initialHp) * 100;
        document.getElementById('enemy-hp-bar').style.width = enemyHpPercent + '%';
        document.getElementById('enemy-name-display').textContent = currentEnemy.name + ` (Lvl ${currentEnemy.lvl})`;
        document.getElementById('enemy-sprite').textContent = currentEnemy.sprite;
        document.getElementById('enemy-hp-detail').textContent = Math.max(0, currentEnemy.hp);
        document.getElementById('enemy-atk-detail').textContent = currentEnemy.attack;
        document.getElementById('enemy-def-detail').textContent = currentEnemy.defense;
    } else {
        hudEnemy.classList.add('hidden-enemy-hud');
        enemyModel.classList.add('hidden-enemy');
        enemyModel.classList.remove('monster-appeared');
    }
}

function updateActions(buttonsHtml) { document.getElementById('action-area').innerHTML = buttonsHtml; }
function logMessage(message) { const logBox = document.getElementById('log-box'); logBox.innerHTML += `<p>${message}</p>`; logBox.scrollTop = logBox.scrollHeight; }
function triggerAnimation(targetElementId, animationClass) { const el = document.getElementById(targetElementId); el.classList.add(animationClass); setTimeout(() => { el.classList.remove(animationClass); isAnimating = false; }, 400); }

// --- FLUXO DO JOGO ---

function showClassSelection() {
    const name = document.getElementById('name-input').value.trim();
    if (!name) return logMessage("[ERRO] DIGITE SEU NOME PARA CONTINUAR.");
    const initialArea = document.getElementById('initial-area');
    initialArea.innerHTML = `
        <p class="ascii-font">ESCOLHA SUA CLASSE, ${name}:</p>
        <button onclick="startGame('${name}', 'GUERREIRO')">🛡️ GUERREIRO (FÚRIA DO MACHADO)</button>
        <button onclick="startGame('${name}', 'MAGO')">🔮 MAGO (EXPLOSÃO ARCANA)</button>
        <button onclick="startGame('${name}', 'ARQUEIRO')">🏹 ARQUEIRO (TIRO PRECISO)</button>
    `;
}

function startGame(name, className) {
    player = new Player(name, className);
    document.getElementById('battle-display').style.display = 'flex';
    logMessage(`[INÍCIO] O ${className} ${name} INICIA A AVENTURA!`);
    updateStats();
    changeScreen('main');
    showMainMenu();
}

// --- DISTRIBUIÇÃO DE PONTOS, MENU PRINCIPAL, COMBATE ---
// (mantido exatamente igual ao seu código original)

// --- SISTEMA DE LOJA (MERCADOR) ADAPTADO POR CLASSE ---
function openShop() {
    changeScreen('shop');
    const potionPrice = 30 + (zonaAtual * 5);
    logMessage(`[MERCADOR] POÇÃO PEQUENA CUSTA ${potionPrice} OURO.`);

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

    const buttons = `
        <p>SEU OURO: <span id="player-gold-shop">${player.gold}</span></p>
        <button onclick="buyItem('potion', ${potionPrice})">COMPRAR POÇÃO (${potionPrice} OURO)</button>
        ${classItems}
        <button onclick="changeScreen('main')">VOLTAR AO MENU</button>
    `;
    document.getElementById('shop-area').innerHTML = buttons;
    updateStats();
}

function buyItem(item, price, statType = null, statValue = 0) {
    if (player.gold >= price) {
        player.gold -= price;
        logMessage(`[COMPRA] ${item.toUpperCase()} ADQUIRIDO!`);
        if (statType === 'ATK') { player.attack += statValue; logMessage(`[STATUS] +${statValue} ATK!`); }
        else if (statType === 'DEF') { player.defense += statValue; logMessage(`[STATUS] +${statValue} DEF!`); }
        else if (item === 'potion') { player.potions++; logMessage(`[LOOT] POÇÃO ADICIONADA!`); }
    } else logMessage(`[ERRO] OURO INSUFICIENTE!`);
    updateStats();
    openShop();
}
