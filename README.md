# PEXESO

Projekt byl vytvořen jako semestrální práce.  Cíl bylo vytořit pexeso, možné hrát na pc i na mobilu, do budoucna možné nastavení vlastních obrázků.
Hra je dostupná online na adrese:  
https://semestralkakaj.netlify.app/

---

# HTML5

## Grafika (SVG / Canvas)
V projektu aktivně pracuji s formátem SVG. Pomocí JavaScriptu (v souboru `cards.js`) dynamicky generuji dekorativní vektorový rub kartiček a tvořím SVG obálky pro vložení lícových obrázků. V čistém HTML pak SVG využívám pro ikony sluníčka a měsíce u přepínače světlého a tmavého režimu.

## Média (Audio/Video)
Zvuková stránka hry je ošetřena v souboru `sounds.js`. Uživatel si může před spuštěním každé hry libovolně upravit hlasitost pomocí formulářového prvku typu `range`, přičemž tato nastavená hodnota se okamžitě aplikuje na všechny herní zvuky.

## Formulářové prvky
Úvodní menu pro nastavení hry je koncipováno jako ucelený formulář. Skládá se z:

- textového pole (`<input type="text">`) pro zadání přezdívky hráče,
- skupiny přepínačů (`<input type="radio">`) pro volbu herní obtížnosti,
- posuvníku pro regulaci hlasitosti zvuku.

---

# CSS

## Pokročilé selektory
V síni slávy využívám pseudoprvek `::before` v kombinaci s `:nth-child(1)`, `(2)` a `(3)` pro automatické vepsání pořadí před samotná jména vítězů.

## CSS3 transformace 2D/3D
Pro efektní animaci otáčení karet na herní ploše jsem využila 3D přetáčení podél osy Y (`rotateY`). U přepínače témat pak využívám jednoduchou 2D rotaci při najetí myší.

## CSS3 transitions / animations
Využívám plynulé přechody (`transition`) pro měkké změny barev při změně tématu a připravila jsem klíčovou animaci `slide-up` (pomocí `@keyframes`) pro plynulé vysunutí offline banneru.

## Media queries
Pomocí responzivních pravidel zajišťuji optimální zobrazení a přizpůsobení herní mřížky a ovládání pro:

- mobilní telefony,
- tablety,
- počítače,
- velké televizní obrazovky.

## Nested CSS
Využívám moderní nativní vnořování stylů a operátor `&` pro přehlednější, čistší a lépe strukturovaný kód v CSS bez zbytečného opakování dlouhých názvů tříd.

---

# JavaScript

## Použití pokročilých JS API
V souboru `storage.js` aktivně pracuji s `LocalStorage API`. To mi umožňuje bezpečně ukládat a zpětně načítat:

- nastavení hlasitosti,
- zvolené grafické téma,
- žebříček nejlepších výsledků hráčů.

Data zůstávají uložená i po zavření prohlížeče.

## Funkční historie
Pomocí `History API` (`history.pushState` a události `popstate`) v souborech `game.js` a `main.js` zajišťuji správnou reakci aplikace na tlačítka „Vpřed“ a „Zpět“ v prohlížeči. Hráč se tak může z rozehrané hry nebo výsledkového okna přirozeně vrátit zpět do hlavního menu.

## Ovládání médií
Pro ozvučení hry využívám `Web Audio API` v souboru `sounds.js`. Zvuky (otočení karty, shoda, výhra) negeneruji ze souborů, ale programově pomocí oscilátorů a gain uzlů. To mi umožňuje plynule měnit hlasitost celého systému podle nastavení uživatele.

## Offline aplikace
Aplikace je plně připravená na offline provoz. Sleduji stav připojení pomocí vlastnosti `navigator.onLine`. Pokud dojde k výpadku internetu, v menu se zobrazí varovný offline banner, ale hra funguje bez omezení dál.

## JS práce s SVG
V souboru `main.js` manipuluji s SVG elementy v závislosti na změně světlého a tmavého režimu. JavaScript dynamicky přepíná datové atributy dokumentu, na což reagují vložené SVG ikony slunce a měsíce, které plynule mění svou viditelnost a velikost.

## Webová komponenta
Pro závěrečné vyhodnocení hry jsem vytvořila vlastní znovupoužitelnou webovou komponentu `<win-modal>`. Využívám k tomu `Custom Elements API` (soubor `win-modal.js`), kde rozšiřuji standardní `HTMLElement` a pomocí vlastních událostí (`Custom Events`) předávám herní statistiky.

---

# Návod ke hraní

## Před hrou
1. Zadejte svou přezdívku.
2. Zvolte si obtížnost:
   - Lehká (4x4)
   - Střední (6x6)
3. Upravte hlasitost posuvníkem.
4. Klikněte na tlačítko **„Zahájit hru“**.

## Průběh hry
- Otáčejte postupně dvojice karet a hledejte shodné symboly.
- Horní lišta zobrazuje:
  - aktuální čas,
  - počet tahů,
  - počet nalezených párů.

## Konec hry
Po úspěšném nalezení všech párů se váš výsledek (pokud patří k nejlepším) automaticky zapíše do Síně slávy.

Pomocí tlačítka **„Menu“** se můžete z vyskakovacího okna vrátit zpět na úvodní obrazovku.
