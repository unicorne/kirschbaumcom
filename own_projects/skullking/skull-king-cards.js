/* ============================================================================
   Skull King — card factory
   ----------------------------------------------------------------------------
   No dependencies. Works as a global (window.SkullKing) or ES import.

   CARD OBJECTS
     { type:'number', suit:'parrot'|'treasure'|'map'|'jollyroger', rank:1..14 }
     { type:'skullking' }
     { type:'pirate', name:'bendt'|'rosie'|'harry'|'juanita'|'rascal' }
     { type:'mermaid', name:'alyra'|'sirena' }
     { type:'tigress' }
     { type:'escape' }
     { type:'kraken' }
     { type:'whitewhale' }

   USAGE
     <link rel="stylesheet" href="skull-king-cards.css">
     <script src="skull-king-cards.js"></script>
     const el = SkullKing.createCard({type:'pirate', name:'rosie'});
     document.querySelector('#hand').appendChild(el);
     SkullKing.init();                       // wire tilt/flip/particles (once)
     // or render a whole deck:
     SkullKing.renderDeck('#deck', SkullKing.standardDeck());

   Each card is 200x280 (5:7). Scale with CSS by sizing .sk-slot.
   ========================================================================== */
(function (root) {
  'use strict';

  /* ---- shared bits --------------------------------------------------------- */
  var GOLD = '<linearGradient id="skGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F0D584"/><stop offset=".5" stop-color="#C7A24A"/><stop offset="1" stop-color="#8A6A22"/></linearGradient>';

  var FRAME =
    '<rect x="8" y="8" width="184" height="264" rx="9" fill="none" stroke="url(#skGold)" stroke-width="1.6"/>' +
    '<rect x="13" y="13" width="174" height="254" rx="6" fill="none" stroke="#E6D8B2" stroke-width="0.6" opacity="0.5"/>' +
    '<g fill="none" stroke="url(#skGold)" stroke-width="1.1">' +
    '<path transform="translate(15,15)" d="M0,20 C0,8 8,0 20,0"/>' +
    '<path transform="translate(185,15) scale(-1,1)" d="M0,20 C0,8 8,0 20,0"/>' +
    '<path transform="translate(15,265) scale(1,-1)" d="M0,20 C0,8 8,0 20,0"/>' +
    '<path transform="translate(185,265) scale(-1,-1)" d="M0,20 C0,8 8,0 20,0"/></g>';

  function plate(text, fill) {
    fill = fill || '#0A0E14';
    return '<path d="M56,242 L144,242 L152,254 L144,266 L56,266 L48,254 Z" fill="' + fill +
      '" stroke="url(#skGold)" stroke-width="1.2"/>' +
      '<text x="100" y="259" text-anchor="middle" style="font-family:Georgia,\'Times New Roman\',serif;font-size:14px;letter-spacing:2px" fill="#E6D29A">' + text + '</text>';
  }

  // gold crowned-skull cipher used on every card back
  var BACK_MONO =
    '<svg class="sk-back-mono" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
    '<circle cx="50" cy="50" r="40" fill="none" stroke="#BF9A4E" stroke-width="1.4"/>' +
    '<circle cx="50" cy="50" r="34" fill="none" stroke="#BF9A4E" stroke-width="0.6" opacity="0.6"/>' +
    '<ellipse cx="50" cy="53" rx="14" ry="13" fill="#BF9A4E"/>' +
    '<path d="M40,64 C39,73 45,80 50,80 C55,80 61,73 60,64 Z" fill="#BF9A4E"/>' +
    '<ellipse cx="44.5" cy="51" rx="3.4" ry="4.2" fill="#0C2A2C"/><ellipse cx="55.5" cy="51" rx="3.4" ry="4.2" fill="#0C2A2C"/>' +
    '<path d="M50,60 L47,54 L53,54 Z" fill="#0C2A2C"/>' +
    '<path d="M40,42 C39,35 61,35 60,42 C54,38 46,38 40,42 Z" fill="#BF9A4E"/>' +
    '<path d="M41,40 L43,30 L48,39 Z M48,39 L50,28 L52,39 Z M52,39 L57,30 L59,40 Z" fill="#BF9A4E"/>' +
    '<circle cx="50" cy="28" r="2" fill="#8E2C2C"/></svg>';

  var BACK = '<div class="sk-back-pat"></div><div class="sk-back-bdr"></div>' + BACK_MONO;

  function svg(inner) {
    return '<svg viewBox="0 0 200 280" xmlns="http://www.w3.org/2000/svg"><defs>' + GOLD + '</defs>' + inner + '</svg>';
  }
  // dark/gold special wrapper: art (incl. its own base rect + defs) + frame + nameplate
  function special(defs, art, name, plateFill) {
    return svg('<defs>' + defs + '</defs>' + art + FRAME + plate(name, plateFill));
  }
  var pirateCurls = ''; // corners come from FRAME

  /* ---- number cards (cream stock, suit-coloured) --------------------------- */
  var SUIT = {
    parrot:     { main:'#1E8C6E', dark:'#134E3E', light:'#DCEDE6', name:'parrot' },
    treasure:   { main:'#C68A2E', dark:'#7E551A', light:'#F0E4C8', name:'treasure' },
    map:        { main:'#6E55A6', dark:'#463473', light:'#E2DAF0', name:'map' },
    jollyroger: { main:'#23262C', dark:'#0F1115', light:'#E6E4DD', name:'jollyroger' }
  };

  function emblem(suit) {
    var s = SUIT[suit];
    if (suit === 'parrot') return (
      '<g class="sk-crest"><path d="M100,108 C92,90 82,90 84,98 C90,102 96,108 100,108 Z" fill="#134E3E"/>' +
      '<path d="M106,106 C102,86 92,86 92,96 C98,100 104,108 106,106 Z" fill="#1E8C6E"/>' +
      '<path d="M112,108 C112,90 102,88 100,96 C106,100 110,110 112,108 Z" fill="#134E3E"/></g>' +
      '<path d="M82,170 C72,150 76,118 100,108 C118,100 132,112 130,126 C129,134 124,140 118,146 C124,150 120,162 110,166 C100,170 90,172 82,170 Z" fill="#1E8C6E"/>' +
      '<path d="M126,118 C144,118 150,130 144,140 C140,147 130,148 125,143 C130,136 124,131 122,127 C122,122 124,119 126,118 Z" fill="#E6A93B"/>' +
      '<path d="M125,141 C133,146 138,150 131,152 C127,153 124,150 124,146 Z" fill="#C68A2E"/>' +
      '<circle cx="130" cy="126" r="1.5" fill="#1C2A26"/>' +
      '<ellipse cx="110" cy="124" rx="11" ry="9" fill="#CDE7DD"/>' +
      '<circle cx="111" cy="123" r="4.5" fill="#1C2A26"/><circle cx="112.5" cy="121.5" r="1.3" fill="#F5F1E7"/>' +
      '<ellipse class="sk-lid" cx="111" cy="123" rx="5.4" ry="7" fill="#CDE7DD"/>' +
      '<path d="M86,168 C90,156 104,154 112,162 C106,168 94,170 86,168 Z" fill="#D8654A"/>'
    );
    if (suit === 'treasure') return (
      '<circle cx="74" cy="184" r="6" fill="#EBC75E" stroke="#C9A23E" stroke-width="0.8"/><circle cx="86" cy="188" r="5" fill="#EBC75E" stroke="#C9A23E" stroke-width="0.8"/><circle cx="128" cy="186" r="6" fill="#EBC75E" stroke="#C9A23E" stroke-width="0.8"/>' +
      '<path d="M62,142 C62,116 138,116 138,142 Z" fill="#B07A26"/>' +
      '<rect x="62" y="140" width="76" height="46" rx="5" fill="#C68A2E"/>' +
      '<rect x="60" y="137" width="80" height="6" rx="2" fill="#5E3F16"/>' +
      '<rect x="74" y="120" width="6" height="66" fill="#5E3F16"/><rect x="120" y="120" width="6" height="66" fill="#5E3F16"/>' +
      '<rect x="92" y="150" width="16" height="18" rx="2" fill="#EBC75E" stroke="#5E3F16" stroke-width="1"/>' +
      '<circle cx="100" cy="157" r="2.4" fill="#5E3F16"/><rect x="99" y="157" width="2" height="6" fill="#5E3F16"/>'
    );
    if (suit === 'map') return (
      '<circle cx="100" cy="140" r="48" fill="none" stroke="#6E55A6" stroke-width="1.2"/>' +
      '<g class="sk-rose">' +
      '<path d="M100,140 L128,112 M100,140 L72,112 M100,140 L128,168 M100,140 L72,168" stroke="#B9A8DD" stroke-width="3" fill="none"/>' +
      '<path d="M100,140 L100,96 L92,128 Z" fill="#463473"/><path d="M100,140 L100,96 L108,128 Z" fill="#6E55A6"/>' +
      '<path d="M100,140 L144,140 L112,132 Z" fill="#6E55A6"/><path d="M100,140 L144,140 L112,148 Z" fill="#463473"/>' +
      '<path d="M100,140 L100,184 L92,152 Z" fill="#6E55A6"/><path d="M100,140 L100,184 L108,152 Z" fill="#463473"/>' +
      '<path d="M100,140 L56,140 L88,132 Z" fill="#463473"/><path d="M100,140 L56,140 L88,148 Z" fill="#6E55A6"/>' +
      '<circle cx="100" cy="140" r="7" fill="#D7B65A" stroke="#463473" stroke-width="1"/><circle cx="100" cy="140" r="2.5" fill="#463473"/></g>'
    );
    // jollyroger (trump) — bold skull
    return (
      '<ellipse cx="100" cy="128" rx="27" ry="25" fill="#23262C"/>' +
      '<path d="M80,144 C78,162 88,176 100,178 C112,176 122,162 120,144 Z" fill="#23262C"/>' +
      '<ellipse cx="89" cy="126" rx="7" ry="9" fill="#F5F1E7"/><ellipse cx="111" cy="126" rx="7" ry="9" fill="#F5F1E7"/>' +
      '<path d="M100,142 L95,132 L105,132 Z" fill="#F5F1E7"/>' +
      '<rect x="88" y="156" width="24" height="12" rx="2" fill="#F5F1E7"/>' +
      '<path d="M94,156 L94,168 M100,156 L100,168 M106,156 L106,168" stroke="#23262C" stroke-width="1.4"/>'
    );
  }

  function pip(suit, x, y) {
    if (suit === 'parrot') return '<circle cx="' + x + '" cy="' + y + '" r="5" fill="#1E8C6E"/><path d="M' + (x + 4) + ',' + (y - 3) + ' L' + (x + 11) + ',' + (y - 1) + ' L' + (x + 5) + ',' + (y + 2) + ' Z" fill="#E6A93B"/>';
    if (suit === 'treasure') return '<circle cx="' + x + '" cy="' + y + '" r="6" fill="#EBC75E" stroke="#8A5E1A" stroke-width="1"/><circle cx="' + x + '" cy="' + y + '" r="2.3" fill="#8A5E1A"/>';
    if (suit === 'map') return '<path d="M' + x + ',' + (y - 8) + ' L' + (x + 3) + ',' + y + ' L' + x + ',' + (y + 8) + ' L' + (x - 3) + ',' + y + ' Z M' + (x - 8) + ',' + y + ' L' + x + ',' + (y - 3) + ' L' + (x + 8) + ',' + y + ' L' + x + ',' + (y + 3) + ' Z" fill="#6E55A6"/>';
    return '<circle cx="' + x + '" cy="' + y + '" r="6" fill="#23262C"/><circle cx="' + (x - 2.5) + '" cy="' + (y - 1) + '" r="1.5" fill="#F5F1E7"/><circle cx="' + (x + 2.5) + '" cy="' + (y - 1) + '" r="1.5" fill="#F5F1E7"/><rect x="' + (x - 3) + '" y="' + (y + 3) + '" width="6" height="3" rx="1" fill="#F5F1E7"/>';
  }

  function numberCard(card) {
    var s = SUIT[card.suit], r = card.rank;
    return '<svg viewBox="0 0 200 280" xmlns="http://www.w3.org/2000/svg">' +
      '<rect x="0" y="0" width="200" height="280" rx="13" fill="#F5F1E7" stroke="#D9D0BC" stroke-width="1"/>' +
      '<rect x="8" y="8" width="184" height="264" rx="8" fill="none" stroke="' + s.main + '" stroke-width="1.2"/>' +
      '<rect x="13" y="13" width="174" height="254" rx="5" fill="none" stroke="' + s.light + '" stroke-width="0.8"/>' +
      '<path d="M8,4 L12,8 L8,12 L4,8 Z M192,4 L196,8 L192,12 L188,8 Z M8,268 L12,272 L8,276 L4,272 Z M192,268 L196,272 L192,276 L188,272 Z" fill="' + s.main + '"/>' +
      '<text x="16" y="34" font-size="20" font-weight="500" fill="' + s.dark + '" style="font-family:system-ui,sans-serif">' + r + '</text>' +
      pip(card.suit, 26, 48) +
      '<text x="184" y="256" text-anchor="end" font-size="20" font-weight="500" fill="' + s.dark + '" style="font-family:system-ui,sans-serif">' + r + '</text>' +
      pip(card.suit, 174, 232) +
      '<circle cx="100" cy="140" r="56" fill="' + s.light + '"/>' +
      '<circle cx="100" cy="140" r="56" fill="none" stroke="' + s.main + '" stroke-width="1" opacity="0.25"/>' +
      emblem(card.suit) +
      '</svg>';
  }

  /* ---- special card art ---------------------------------------------------- */
  // pirate portraits share a clipped medallion on red stock
  function pirate(name) {
    var bg = '<radialGradient id="pbg" cx="50%" cy="44%" r="72%"><stop offset="0" stop-color="#D2503E"/><stop offset="1" stop-color="#882C26"/></radialGradient>';
    var base = '<rect x="0" y="0" width="200" height="280" rx="13" fill="#882C26"/>' +
      '<circle cx="100" cy="128" r="54" fill="url(#pbg)"/><g clip-path="url(#pcl)">';
    var ring = '</g><circle cx="100" cy="128" r="55" fill="none" stroke="url(#skGold)" stroke-width="1.6"/>';
    var clip = '<clipPath id="pcl"><circle cx="100" cy="128" r="54"/></clipPath>';
    var P = {
      bendt: ['Bendt the Brave',
        '<path d="M50,182 C56,162 78,152 100,152 C122,152 146,162 152,182 L152,184 L50,184 Z" fill="#22324C"/>' +
        '<rect x="93" y="142" width="14" height="14" fill="#C49A72"/><ellipse cx="100" cy="120" rx="23" ry="27" fill="#C49A72"/><circle cx="78" cy="122" r="4" fill="#C49A72"/>' +
        '<g class="sk-earring"><circle cx="77" cy="129" r="3.4" fill="none" stroke="url(#skGold)" stroke-width="1.6"/></g>' +
        '<path d="M83,111 q8,-3 15,1 M104,112 q8,-3 13,1" stroke="#5E4028" stroke-width="2" fill="none"/>' +
        '<ellipse cx="91" cy="119" rx="2.6" ry="3" fill="#2A1C12"/><ellipse cx="110" cy="119" rx="2.6" ry="3" fill="#2A1C12"/>' +
        '<path d="M100,120 L98,131 Q100,133 103,131" stroke="#9A744C" stroke-width="1.4" fill="none"/><path d="M85,103 L95,117" stroke="#A8744A" stroke-width="1.6"/>' +
        '<g class="sk-hair"><path d="M78,128 C76,158 90,180 100,182 C110,180 124,158 122,128 C114,142 86,142 78,128 Z" fill="#CFCCC3"/><path d="M88,132 C94,137 106,137 112,132" stroke="#B7B4AA" stroke-width="3" fill="none" stroke-linecap="round"/></g>' +
        '<path d="M60,108 C64,89 136,89 140,108 C152,108 150,117 137,116 C118,108 82,108 63,116 C50,117 48,108 60,108 Z" fill="#16202E"/>' +
        '<path d="M66,110 C82,101 118,101 134,110" stroke="url(#skGold)" stroke-width="1.5" fill="none"/><circle cx="120" cy="103" r="3" fill="url(#skGold)"/>'],
      rosie: ['Rosie D. Laurent',
        '<path d="M50,182 C56,160 78,150 100,150 C122,150 146,160 152,182 L152,184 L50,184 Z" fill="#3A2440"/>' +
        '<rect x="94" y="140" width="13" height="14" fill="#EAC6A6"/>' +
        '<g class="sk-hair"><path d="M70,112 C56,128 56,162 70,184 L80,184 C70,160 74,128 86,114 Z" fill="#8A3F22"/><path d="M130,112 C144,128 144,164 128,186 L120,186 C130,160 126,128 114,114 Z" fill="#7A361E"/></g>' +
        '<ellipse cx="100" cy="120" rx="22" ry="26" fill="#EAC6A6"/>' +
        '<g class="sk-earring"><circle cx="79" cy="130" r="3.4" fill="none" stroke="url(#skGold)" stroke-width="1.6"/></g>' +
        '<path d="M84,113 q8,-2 14,1 M104,114 q7,-2 13,0" stroke="#7A3B22" stroke-width="1.6" fill="none"/>' +
        '<ellipse cx="91" cy="120" rx="2.6" ry="3.2" fill="#2A1212"/><ellipse cx="110" cy="120" rx="2.6" ry="3.2" fill="#2A1212"/>' +
        '<path d="M94,138 Q100,142 106,138" stroke="#9C3A3A" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
        '<path d="M62,106 C66,90 132,90 138,106 C150,106 148,114 136,113 C118,106 82,106 64,113 C52,114 50,106 62,106 Z" fill="#241626"/>' +
        '<path d="M66,108 C82,100 118,100 134,108" stroke="url(#skGold)" stroke-width="1.4" fill="none"/>' +
        '<path d="M118,100 C128,84 140,82 146,88 C138,92 132,98 126,106 Z" fill="#D24B47"/>'],
      harry: ['Harry the Giant',
        '<path d="M44,182 C50,156 76,146 100,146 C124,146 150,156 156,182 L156,184 L44,184 Z" fill="#3A2A1E"/>' +
        '<rect x="92" y="138" width="16" height="14" fill="#8A5A38"/><ellipse cx="100" cy="118" rx="25" ry="28" fill="#8A5A38"/><ellipse cx="100" cy="96" rx="22" ry="10" fill="#7A4E30"/>' +
        '<g class="sk-earring"><circle cx="75" cy="126" r="3.6" fill="none" stroke="url(#skGold)" stroke-width="1.8"/></g>' +
        '<g class="sk-earring" style="animation-delay:-1.5s"><circle cx="125" cy="126" r="3.6" fill="none" stroke="url(#skGold)" stroke-width="1.8"/></g>' +
        '<path d="M82,110 q9,-2 16,1 M104,111 q9,-2 15,0" stroke="#2A1C10" stroke-width="2.6" fill="none"/>' +
        '<ellipse cx="90" cy="117" rx="2.4" ry="2.8" fill="#1C0E06"/><ellipse cx="110" cy="117" rx="2.4" ry="2.8" fill="#1C0E06"/>' +
        '<circle cx="100" cy="132" r="3.2" fill="none" stroke="url(#skGold)" stroke-width="1.6"/><path d="M84,98 L92,114" stroke="#A86A40" stroke-width="1.8"/>' +
        '<g class="sk-hair"><path d="M76,126 C74,156 90,182 100,184 C110,182 126,156 124,126 C114,142 86,142 76,126 Z" fill="#1E1814"/><path d="M86,128 C93,134 107,134 114,128" stroke="#100C0A" stroke-width="4" fill="none" stroke-linecap="round"/></g>'],
      juanita: ['Juanita Jade',
        '<path d="M50,182 C56,160 78,150 100,150 C122,150 146,160 152,182 L152,184 L50,184 Z" fill="#1E6A60"/>' +
        '<rect x="94" y="140" width="13" height="14" fill="#BC8A5C"/><ellipse cx="100" cy="120" rx="22" ry="26" fill="#BC8A5C"/>' +
        '<path d="M82,128 C70,150 72,176 84,184 L92,182 C82,162 84,140 92,126 Z" fill="#15110E"/>' +
        '<g class="sk-earring"><circle cx="79" cy="130" r="3.4" fill="none" stroke="url(#skGold)" stroke-width="1.6"/></g>' +
        '<path d="M85,118 q6,-2 12,0 M104,118 q6,-2 11,0" stroke="#15110E" stroke-width="1.6" fill="none"/>' +
        '<ellipse cx="91" cy="120" rx="2.8" ry="3.2" fill="#1C120A"/><ellipse cx="110" cy="120" rx="2.8" ry="3.2" fill="#1C120A"/>' +
        '<path d="M95,138 Q100,141 105,138" stroke="#7A2E2E" stroke-width="2" fill="none" stroke-linecap="round"/>' +
        '<g class="sk-hair"><path d="M60,108 C66,90 134,90 140,108 C146,104 148,112 142,114 C120,104 80,104 58,114 C52,112 54,104 60,108 Z" fill="#1E7A58"/><path d="M58,112 C50,124 52,138 60,146 L67,139 C60,128 64,118 66,112 Z" fill="#176B4C"/></g>' +
        '<circle cx="100" cy="100" r="4" fill="#1E9E78"/>'],
      rascal: ['Rascal of Roatan',
        '<path d="M50,182 C56,160 78,150 100,150 C122,150 146,160 152,182 L152,184 L50,184 Z" fill="#3A4434"/>' +
        '<rect x="94" y="140" width="13" height="14" fill="#D2A078"/><ellipse cx="100" cy="120" rx="22" ry="26" fill="#D2A078"/>' +
        '<g class="sk-earring"><circle cx="79" cy="130" r="3.4" fill="none" stroke="url(#skGold)" stroke-width="1.6"/></g>' +
        '<path d="M71,118 L120,140" stroke="#0C0E08" stroke-width="2.6" fill="none"/><ellipse cx="89" cy="118" rx="9" ry="8" fill="#0C0E08"/>' +
        '<path d="M104,113 q8,-2 14,1" stroke="#3A2A18" stroke-width="2" fill="none"/><ellipse cx="110" cy="119" rx="2.6" ry="3" fill="#221610"/>' +
        '<path d="M92,139 Q99,145 108,138" stroke="#3A2418" stroke-width="2" fill="none" stroke-linecap="round"/><rect x="99" y="139" width="4" height="6" fill="url(#skGold)"/>' +
        '<g class="sk-hair"><path d="M62,108 C66,90 134,90 138,108 C146,104 148,112 142,116 C120,106 80,106 58,116 C52,112 54,104 62,108 Z" fill="#B23A3A"/><path d="M58,114 C50,126 52,140 60,148 L67,141 C60,130 64,120 66,114 Z" fill="#8E2A2A"/><circle cx="86" cy="100" r="1.5" fill="#F1E4DF"/><circle cx="102" cy="98" r="1.5" fill="#F1E4DF"/><circle cx="118" cy="100" r="1.5" fill="#F1E4DF"/></g>']
    };
    var p = P[name] || P.bendt;
    return { defs: bg + clip, art: base + p[1] + ring, name: p[0], plate: '#4A1614' };
  }

  function mermaid(name) {
    if (name === 'sirena') {
      var sdef = '<radialGradient id="sbg" cx="50%" cy="42%" r="74%"><stop offset="0" stop-color="#EFF7FC"/><stop offset="1" stop-color="#A8CBE0"/></radialGradient>' +
        '<radialGradient id="shalo" cx="50%" cy="48%" r="48%"><stop offset="0" stop-color="#5C92BC" stop-opacity=".42"/><stop offset="1" stop-color="#5C92BC" stop-opacity="0"/></radialGradient>' +
        '<linearGradient id="stail" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#C6ECF4"/><stop offset=".5" stop-color="#93D2E8"/><stop offset="1" stop-color="#79B8DF"/></linearGradient>' +
        '<linearGradient id="sskin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F8FBFE"/><stop offset="1" stop-color="#DCE9F2"/></linearGradient>' +
        '<linearGradient id="shair" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E0ECF5"/><stop offset="1" stop-color="#AFC6DC"/></linearGradient>';
      var sart = '<rect x="0" y="0" width="200" height="280" rx="13" fill="url(#sbg)"/><circle cx="100" cy="130" r="80" fill="url(#shalo)"/>' +
        '<g class="sk-hair"><path d="M84,94 C58,104 54,148 76,186 C66,150 72,110 96,98 Z" fill="url(#shair)"/><path d="M116,94 C142,104 146,150 122,188 C134,150 126,108 104,98 Z" fill="url(#shair)"/></g>' +
        '<g class="sk-tail"><path d="M107,148 C118,170 112,196 98,208 C85,196 82,176 92,156 C94,174 100,184 105,174 C100,164 102,156 107,148 Z" fill="url(#stail)"/><path d="M98,202 C112,210 120,220 108,222 C100,222 98,214 98,210 C98,214 91,221 82,218 C74,214 83,206 94,202 Z" fill="url(#stail)"/></g>' +
        '<path d="M95,150 C90,132 92,114 100,104 C108,114 110,132 105,150 C101,154 99,154 95,150 Z" fill="url(#sskin)"/>' +
        '<path d="M96,116 C84,112 76,103 73,93" stroke="#F8FBFE" stroke-width="5" fill="none" stroke-linecap="round"/>' +
        '<ellipse cx="100" cy="99" rx="8.5" ry="9.5" fill="url(#sskin)"/><path d="M97,98 q3,2 6,0" stroke="#9BB4C8" stroke-width="0.8" fill="none"/>' +
        '<circle cx="111" cy="96" r="2" fill="#FFFFFF"/><circle cx="88" cy="97" r="1.8" fill="#FFFFFF"/>' +
        '<circle class="sk-glow sk-d2" cx="80" cy="138" r="1.8" fill="#DFF6FF"/><circle class="sk-glow sk-d1" cx="100" cy="124" r="2.2" fill="#DFF6FF"/>';
      return { defs: sdef, art: sart, name: 'Sirena', plate: '#0E2A3A', light: true, fx: 'mermaid' };
    }
    var adef = '<radialGradient id="abg" cx="50%" cy="42%" r="74%"><stop offset="0" stop-color="#E6F2FA"/><stop offset="1" stop-color="#9CC4DE"/></radialGradient>' +
      '<radialGradient id="ahalo" cx="50%" cy="48%" r="48%"><stop offset="0" stop-color="#4E86AE" stop-opacity=".5"/><stop offset="1" stop-color="#4E86AE" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="atail" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6CC6E2"/><stop offset=".5" stop-color="#4A8FD6"/><stop offset="1" stop-color="#5E6FC8"/></linearGradient>' +
      '<linearGradient id="askin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F4F9FC"/><stop offset="1" stop-color="#CFE0EC"/></linearGradient>' +
      '<linearGradient id="ahair" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2E6E8C"/><stop offset="1" stop-color="#1E4E7A"/></linearGradient>';
    var aart = '<rect x="0" y="0" width="200" height="280" rx="13" fill="url(#abg)"/><circle cx="100" cy="130" r="80" fill="url(#ahalo)"/>' +
      '<g class="sk-hair"><path d="M86,96 C62,106 58,150 80,184 C70,150 76,112 96,100 Z" fill="url(#ahair)"/><path d="M114,96 C140,106 144,154 120,186 C132,150 124,110 104,100 Z" fill="url(#ahair)"/></g>' +
      '<g class="sk-tail"><path d="M93,148 C84,170 90,194 102,206 C115,195 119,177 110,156 C106,174 100,184 96,174 C100,164 100,156 96,148 Z" fill="url(#atail)"/><path d="M102,202 C88,210 80,218 92,220 C100,220 102,213 102,209 C102,213 109,220 118,217 C126,213 117,206 106,202 Z" fill="url(#atail)"/></g>' +
      '<path d="M95,150 C90,132 92,114 100,104 C108,114 110,132 105,150 C101,154 99,154 95,150 Z" fill="url(#askin)"/>' +
      '<path d="M104,116 C117,112 125,103 128,93" stroke="#F4F9FC" stroke-width="5" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="100" cy="99" rx="8.5" ry="9.5" fill="url(#askin)"/><path d="M97,98 q3,2 6,0" stroke="#7FA0B4" stroke-width="0.8" fill="none"/>' +
      '<circle cx="89" cy="96" r="2" fill="#FFFFFF"/><circle cx="112" cy="97" r="1.8" fill="#FFFFFF"/>' +
      '<circle class="sk-glow" cx="100" cy="124" r="2.2" fill="#CFF4FF"/><circle class="sk-glow sk-d2" cx="121" cy="138" r="1.8" fill="#CFF4FF"/>';
    return { defs: adef, art: aart, name: 'Alyra', plate: '#0E2A3A', light: true, fx: 'mermaid' };
  }

  function skullking() {
    var rays = '';
    for (var i = 0; i < 8; i++) rays += '<path transform="translate(100,134) rotate(' + (i * 45) + ')" d="M-2.4,0 L2.4,0 L0,-94 Z" fill="#C9A44C"/>';
    var defs = '<radialGradient id="skbg" cx="50%" cy="44%" r="70%"><stop offset="0" stop-color="#1A2029"/><stop offset="1" stop-color="#070A0E"/></radialGradient>';
    var art = '<rect x="0" y="0" width="200" height="280" rx="13" fill="url(#skbg)"/>' +
      '<g class="sk-rays" opacity="0.5">' + rays + '</g>' +
      '<g transform="translate(100,134) rotate(-40)"><circle cx="-56" cy="0" r="5" fill="url(#skGold)"/><rect x="-54" y="-3" width="22" height="6" rx="3" fill="#8A6A22"/><path d="M-32,-8 L-32,8 L-26,6 L-26,-6 Z" fill="url(#skGold)"/><path d="M-26,-2.6 L52,-1.4 L62,0 L52,1.4 L-26,2.6 Z" fill="#A9B0B4"/></g>' +
      '<g transform="translate(100,134) rotate(-140)"><circle cx="-56" cy="0" r="5" fill="url(#skGold)"/><rect x="-54" y="-3" width="22" height="6" rx="3" fill="#8A6A22"/><path d="M-32,-8 L-32,8 L-26,6 L-26,-6 Z" fill="url(#skGold)"/><path d="M-26,-2.6 L52,-1.4 L62,0 L52,1.4 L-26,2.6 Z" fill="#A9B0B4"/></g>' +
      '<ellipse cx="100" cy="140" rx="28" ry="26" fill="#ECE5CF"/><ellipse cx="91" cy="130" rx="14" ry="11" fill="#F7F1E0" opacity="0.6"/>' +
      '<path d="M79,156 C77,176 88,190 100,192 C112,190 123,176 121,156 Z" fill="#ECE5CF"/>' +
      '<ellipse cx="89" cy="138" rx="7.5" ry="9.5" fill="#120E0A"/><ellipse cx="111" cy="138" rx="7.5" ry="9.5" fill="#120E0A"/>' +
      '<circle class="sk-ember" cx="89" cy="138" r="4.8" fill="#E0481F"/><circle class="sk-ember" cx="111" cy="138" r="4.8" fill="#E0481F"/>' +
      '<path d="M100,154 L94,143 L106,143 Z" fill="#120E0A"/>' +
      '<rect x="87" y="170" width="26" height="13" rx="2" fill="#ECE5CF"/><path d="M93.5,170 L93.5,183 M100,170 L100,183 M106.5,170 L106.5,183" stroke="#120E0A" stroke-width="1.4"/>' +
      '<path d="M74,118 C72,104 128,104 126,118 C116,111 84,111 74,118 Z" fill="url(#skGold)"/>' +
      '<path d="M76,114 L78,92 L88,110 Z M92,110 L100,88 L108,110 Z M112,110 L122,92 L124,114 Z M84,112 L86,98 L94,110 Z M106,110 L114,98 L116,112 Z" fill="url(#skGold)"/>' +
      '<circle class="sk-jewel" cx="100" cy="86" r="4" fill="#8E2C2C"/><circle cx="78" cy="91" r="2.6" fill="#C9A44C"/><circle cx="122" cy="91" r="2.6" fill="#C9A44C"/>' +
      '<circle class="sk-jewel sk-d2" cx="88" cy="115" r="2.8" fill="#8E2C2C"/><circle class="sk-jewel" cx="100" cy="115" r="3.4" fill="#1E6E5C"/><circle class="sk-jewel sk-d3" cx="112" cy="115" r="2.8" fill="#8E2C2C"/>';
    return { defs: defs, art: art, name: 'Skull King', plate: '#0A0D12', fx: 'dust' };
  }

  function kraken() {
    var defs = '<radialGradient id="kbg" cx="50%" cy="40%" r="78%"><stop offset="0" stop-color="#5C1A1C"/><stop offset="1" stop-color="#140406"/></radialGradient>' +
      '<linearGradient id="ktentA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7A2428"/><stop offset="1" stop-color="#2A0A0C"/></linearGradient>' +
      '<radialGradient id="kiris" cx="50%" cy="50%" r="55%"><stop offset="0" stop-color="#FFE6A0"/><stop offset=".5" stop-color="#E0A030"/><stop offset="1" stop-color="#5A2410"/></radialGradient>' +
      '<radialGradient id="kglow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFB85A" stop-opacity=".55"/><stop offset="1" stop-color="#FFB85A" stop-opacity="0"/></radialGradient>';
    var art = '<rect x="0" y="0" width="200" height="280" rx="13" fill="url(#kbg)"/><circle cx="100" cy="116" r="84" fill="url(#kglow)"/>' +
      '<g class="sk-tent1"><path d="M96,212 C70,200 40,170 36,124 C33,98 44,84 56,86 C48,94 46,114 52,140 C58,176 78,198 102,210 Z" fill="url(#ktentA)"/><path d="M104,212 C130,200 160,170 164,124 C167,98 156,84 144,86 C152,94 154,114 148,140 C142,176 122,198 98,210 Z" fill="url(#ktentA)"/><path d="M100,214 C92,190 88,158 92,118 C94,96 100,88 106,94 C100,102 98,128 102,158 C104,184 104,200 100,214 Z" fill="#5A1A1E"/></g>' +
      '<g class="sk-tent2"><path d="M94,214 C72,204 50,184 48,150 C47,132 56,124 66,126 C58,134 58,152 64,174 C70,194 86,206 104,212 Z" fill="#6A2024"/><path d="M106,214 C128,204 150,184 152,150 C153,132 144,124 134,126 C142,134 142,152 136,174 C130,194 114,206 96,212 Z" fill="#6A2024"/></g>' +
      '<circle cx="100" cy="116" r="26" fill="url(#kglow)" class="sk-glow"/>' +
      '<path d="M70,116 C82,98 118,98 130,116 C118,134 82,134 70,116 Z" fill="#2A0C0E"/>' +
      '<ellipse cx="100" cy="116" rx="20" ry="15" fill="url(#kiris)"/><ellipse cx="100" cy="116" rx="3.4" ry="12" fill="#160806"/><circle cx="94" cy="110" r="2.4" fill="#FFF6E0" opacity="0.85"/>' +
      '<path d="M70,116 C82,100 118,100 130,116" fill="none" stroke="#1C0608" stroke-width="2"/>' +
      '<g class="sk-tent3"><path d="M100,216 C84,212 72,198 72,180 C72,170 78,166 84,168 C80,172 80,184 86,194 C92,204 106,210 116,212 Z" fill="#7E2A2E"/><path d="M100,216 C116,212 128,198 128,180 C128,170 122,166 116,168 C120,172 120,184 114,194 C108,204 94,210 84,212 Z" fill="#742428"/><path d="M86,150 C76,142 70,130 74,122 C77,116 83,118 84,124 C80,128 82,136 90,144 Z" fill="#8A2E32"/><path d="M114,150 C124,142 130,130 126,122 C123,116 117,118 116,124 C120,128 118,136 110,144 Z" fill="#8A2E32"/></g>' +
      '<circle class="sk-glow" cx="58" cy="172" r="2.4" fill="#FFC878"/><circle class="sk-glow sk-d2" cx="142" cy="168" r="2.2" fill="#FFC878"/>';
    return { defs: defs, art: art, name: 'Kraken', plate: '#140406', fx: 'ink' };
  }

  function whitewhale() {
    var defs = '<radialGradient id="wbg" cx="50%" cy="26%" r="86%"><stop offset="0" stop-color="#F2F7FA"/><stop offset="1" stop-color="#BACFDB"/></radialGradient>' +
      '<linearGradient id="wbody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6F9FB"/><stop offset="1" stop-color="#C6D4DC"/></linearGradient>' +
      '<radialGradient id="whalo" cx="50%" cy="52%" r="52%"><stop offset="0" stop-color="#7FA6BE" stop-opacity=".34"/><stop offset="1" stop-color="#7FA6BE" stop-opacity="0"/></radialGradient>';
    var art = '<rect x="0" y="0" width="200" height="280" rx="13" fill="url(#wbg)"/>' +
      '<g class="sk-godrays"><path d="M100,8 L150,250 L130,250 Z" fill="#FFFFFF" opacity="0.14"/><path d="M100,8 L70,250 L52,250 Z" fill="#FFFFFF" opacity="0.12"/><path d="M100,8 L108,250 L96,250 Z" fill="#FFFFFF" opacity="0.16"/></g>' +
      '<circle cx="100" cy="140" r="82" fill="url(#whalo)"/>' +
      '<g class="sk-spray"><circle cx="66" cy="76" r="9" fill="#FFFFFF" opacity="0.85"/><circle cx="58" cy="70" r="6" fill="#FFFFFF" opacity="0.8"/><circle cx="74" cy="68" r="6" fill="#FFFFFF" opacity="0.8"/><circle cx="64" cy="62" r="4" fill="#FFFFFF" opacity="0.7"/></g>' +
      '<g class="sk-whale">' +
      '<path d="M58,96 C82,84 124,90 152,128 C158,136 162,144 166,150 C150,148 138,148 128,152 C100,160 70,152 56,132 C48,120 50,104 58,96 Z" fill="url(#wbody)" stroke="#A9BCC6" stroke-width="0.8"/>' +
      '<path d="M70,148 C96,158 124,156 150,150 C150,150 140,150 128,152 C100,160 76,154 64,140 Z" fill="#C8D6DE" opacity="0.8"/>' +
      '<path d="M150,128 C170,116 186,116 188,122 C180,128 174,136 172,146 C180,152 184,162 180,168 C170,160 158,146 150,142 Z" fill="url(#wbody)" stroke="#A9BCC6" stroke-width="0.8"/>' +
      '<path d="M92,150 C86,162 88,176 96,176 C100,166 100,154 96,150 Z" fill="#D2DEE4" stroke="#A9BCC6" stroke-width="0.6"/>' +
      '<path d="M62,118 C84,122 116,122 146,130" fill="none" stroke="#9FB4BE" stroke-width="1.2"/>' +
      '<circle cx="74" cy="112" r="2.6" fill="#2A3942"/><circle cx="75" cy="111" r="0.9" fill="#FFFFFF"/>' +
      '<path d="M96,104 q10,2 18,6 M104,114 q12,1 20,5" stroke="#FFFFFF" stroke-width="1" fill="none" opacity="0.7"/></g>' +
      '<g class="sk-spray" style="animation-delay:-1.6s"><circle cx="120" cy="172" r="6" fill="#FFFFFF" opacity="0.7"/><circle cx="100" cy="178" r="7" fill="#FFFFFF" opacity="0.7"/><circle cx="84" cy="174" r="5" fill="#FFFFFF" opacity="0.6"/></g>';
    return { defs: defs, art: art, name: 'White Whale', plate: '#0E2A3A', light: true, fx: 'mermaid' };
  }

  function tigress() {
    var defs = '<radialGradient id="tbg" cx="50%" cy="46%" r="70%"><stop offset="0" stop-color="#D2503E"/><stop offset="1" stop-color="#882C26"/></radialGradient>' +
      '<linearGradient id="tsteel" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E2E7E9"/><stop offset="1" stop-color="#8A9498"/></linearGradient>' +
      '<clipPath id="tcl"><circle cx="100" cy="146" r="44"/></clipPath>';
    var art = '<rect x="0" y="0" width="200" height="280" rx="14" fill="#882C26"/>' +
      '<path d="M52,44 L60,42 L120,104 L116,112 L108,112 L50,52 Z" fill="url(#tsteel)"/><path d="M55,46 L114,106" stroke="#F2F6F7" stroke-width="0.8"/>' +
      '<path d="M112,100 L124,112 L118,118 L106,106 Z" fill="url(#skGold)"/><rect x="116" y="110" width="16" height="7" rx="3" transform="rotate(45 124 113)" fill="#7A5A2A"/><circle cx="131" cy="120" r="4" fill="url(#skGold)"/>' +
      '<rect x="146" y="52" width="3.4" height="66" rx="1.7" fill="#7A5A2A"/><circle cx="147.6" cy="50" r="3.4" fill="url(#skGold)"/>' +
      '<g class="sk-flag"><path d="M150,54 C162,49 176,58 188,52 C186,63 188,74 186,84 C176,79 162,88 150,83 C151,72 150,63 150,54 Z" fill="#FFFFFF" stroke="#B6B6AE" stroke-width="0.7"/><path d="M158,55 C160,64 159,74 157,82 M168,57 C170,66 169,76 167,83" stroke="#DADAD2" stroke-width="1" fill="none"/></g>' +
      '<circle cx="100" cy="146" r="44" fill="url(#tbg)"/><g clip-path="url(#tcl)">' +
      '<path d="M58,190 C62,170 80,162 100,162 C120,162 138,170 142,190 L142,192 L58,192 Z" fill="#3A2418"/>' +
      '<rect x="94" y="156" width="12" height="12" fill="#C9925E"/>' +
      '<path d="M80,142 C70,160 72,184 82,190 L89,188 C80,170 82,150 89,140 Z" fill="#241810"/><path d="M120,142 C130,160 128,184 118,190 L111,188 C120,170 118,150 111,140 Z" fill="#241810"/>' +
      '<ellipse cx="100" cy="140" rx="20" ry="23" fill="#C9925E"/>' +
      '<g class="sk-earring"><circle cx="81" cy="150" r="3" fill="none" stroke="url(#skGold)" stroke-width="1.5"/></g>' +
      '<path d="M86,133 q6,-4 12,-1 M101,132 q6,-4 12,1" stroke="#241608" stroke-width="1.8" fill="none"/>' +
      '<ellipse cx="92" cy="140" rx="3.6" ry="3" fill="#F2E6C8"/><ellipse cx="108" cy="140" rx="3.6" ry="3" fill="#F2E6C8"/>' +
      '<circle class="sk-glow" cx="92" cy="140" r="2.3" fill="#E8A828"/><circle class="sk-glow sk-d1" cx="108" cy="140" r="2.3" fill="#E8A828"/>' +
      '<circle cx="92" cy="140" r="1.1" fill="#1C1208"/><circle cx="108" cy="140" r="1.1" fill="#1C1208"/>' +
      '<path d="M93,159 Q100,163 107,159" stroke="#7A2E2E" stroke-width="1.8" fill="none" stroke-linecap="round"/>' +
      '<path d="M74,130 C72,114 128,114 126,130 C116,122 84,122 74,130 Z" fill="#DA8C3A"/>' +
      '<path d="M78,125 q5,4 0,8 M90,121 q5,5 0,9 M102,120 q5,5 0,9 M114,122 q5,4 0,8" stroke="#241608" stroke-width="1.8" fill="none"/></g>' +
      '<circle cx="100" cy="146" r="45" fill="none" stroke="url(#skGold)" stroke-width="1.6"/>' +
      '<g transform="translate(40,250)"><circle r="11" fill="#4A1614" stroke="url(#skGold)" stroke-width="1.2"/><path d="M-5,5 L4,-5" stroke="url(#tsteel)" stroke-width="2.4"/><path d="M3,-6 L6,-3 L4,-1 Z" fill="url(#skGold)"/></g>' +
      '<g transform="translate(160,250)"><circle r="11" fill="#4A1614" stroke="url(#skGold)" stroke-width="1.2"/><rect x="-5" y="-6" width="1.6" height="13" fill="url(#skGold)"/><path d="M-3.4,-6 C0,-8 4,-4 7,-6 C6,-2 7,2 6,5 C3,2 0,5 -3.4,4 Z" fill="#FFFFFF" stroke="#B6B6AE" stroke-width="0.5"/></g>';
    return { defs: defs, art: art, name: 'Tigress', plate: '#4A1614', fx: 'glint' };
  }

  function escape() {
    var defs = '<radialGradient id="ebg" cx="50%" cy="40%" r="74%"><stop offset="0" stop-color="#E8EDF0"/><stop offset="1" stop-color="#AFC0C8"/></radialGradient>';
    var art = '<rect x="0" y="0" width="200" height="280" rx="13" fill="url(#ebg)"/>' +
      // sea
      '<path d="M13,176 C50,168 70,184 100,178 C130,172 150,186 187,178 L187,267 L13,267 Z" fill="#9FB6C2" opacity="0.5"/>' +
      '<path d="M13,176 C50,168 70,184 100,178 C130,172 150,186 187,178" fill="none" stroke="#7E96A2" stroke-width="1"/>' +
      // looming galleon shadow
      '<path d="M120,60 L168,60 L160,150 L128,150 Z" fill="#5E6E76" opacity="0.35"/><rect x="142" y="36" width="3" height="28" fill="#5E6E76" opacity="0.35"/>' +
      // little rowboat with sailor + white kerchief
      '<g class="sk-whale">' +
      '<path d="M58,168 C70,182 110,182 122,168 C118,176 110,182 90,182 C70,182 62,176 58,168 Z" fill="#6E4A2E"/>' +
      '<path d="M62,166 L118,166 L114,172 L66,172 Z" fill="#8A5E38"/>' +
      '<ellipse cx="90" cy="150" rx="7" ry="9" fill="#3A4A52"/>' + // sailor body
      '<circle cx="90" cy="138" r="5" fill="#C9A07A"/>' + // head
      '<rect x="89" y="118" width="2" height="22" fill="#7A5A2A"/>' + // pole
      '<g class="sk-flag"><path d="M91,118 C100,114 110,120 119,116 C117,123 119,130 117,136 C108,131 100,138 91,134 Z" fill="#FFFFFF" stroke="#C2C2BA" stroke-width="0.6"/></g></g>' +
      '<text x="22" y="40" font-size="22" font-weight="600" fill="#4A5A62" style="font-family:Georgia,serif">0</text>';
    return { defs: defs, art: art, name: 'Escape', plate: '#3A4A52', light: true };
  }

  /* ---- effect overlays per faction ----------------------------------------- */
  function overlays(kind, fx) {
    var h = '';
    if (kind === 'light') h += '<div class="sk-holo-soft"></div>';
    else if (kind === 'number') h += '<div class="sk-sheen"></div>';
    else h += '<div class="sk-holo"></div>';
    if (fx === 'glint') h += '<div class="sk-glint"></div>';
    if (fx === 'mermaid') h += '<div class="sk-caustic"></div><div class="sk-particles" data-kind="bubble"></div>';
    if (fx === 'dust') h += '<div class="sk-particles" data-kind="dust"></div>';
    if (fx === 'ink') h += '<div class="sk-particles" data-kind="ink"></div>';
    h += '<div class="sk-glare"></div>';
    return h;
  }

  /* ---- dispatch ------------------------------------------------------------ */
  function build(card) {
    var t = card.type, spec, kind;
    if (t === 'number') return { front: numberCard(card), kind: 'number', fx: null };
    if (t === 'skullking') spec = skullking();
    else if (t === 'pirate') spec = pirate(card.name);
    else if (t === 'mermaid') spec = mermaid(card.name);
    else if (t === 'tigress') spec = tigress();
    else if (t === 'kraken') spec = kraken();
    else if (t === 'whitewhale') spec = whitewhale();
    else if (t === 'escape') spec = escape();
    else spec = skullking();
    kind = spec.light ? 'light' : 'dark';
    return { front: special(spec.defs, spec.art, spec.name, spec.plate), kind: kind, fx: spec.fx };
  }

  function cardHTML(card) {
    var b = build(card);
    return '<div class="sk-slot"><div class="sk-tilter"><div class="sk-flipper">' +
      '<div class="sk-face sk-front">' + b.front + overlays(b.kind, b.fx) + '</div>' +
      '<div class="sk-face sk-back">' + BACK + '</div>' +
      '</div></div></div>';
  }

  function createCard(card) {
    var wrap = document.createElement('div');
    wrap.innerHTML = cardHTML(card);
    var el = wrap.firstChild;
    spawn(el);
    wire(el);
    return el;
  }

  function renderDeck(target, cards) {
    var c = typeof target === 'string' ? document.querySelector(target) : target;
    if (!c) return;
    if (!c.classList.contains('sk-deck')) c.classList.add('sk-deck');
    cards.forEach(function (card) { c.appendChild(createCard(card)); });
  }

  /* ---- interactions -------------------------------------------------------- */
  function spawn(scope) {
    (scope || document).querySelectorAll('.sk-particles').forEach(function (box) {
      if (box.dataset.filled) return;
      box.dataset.filled = '1';
      var kind = box.getAttribute('data-kind');
      for (var i = 0; i < 7; i++) {
        var s = document.createElement('span');
        var bubble = kind === 'bubble';
        var sz = bubble ? (3 + Math.random() * 5) : (kind === 'dust' ? 1.5 + Math.random() * 2.5 : 2.5 + Math.random() * 4);
        s.style.width = sz + 'px'; s.style.height = sz + 'px';
        s.style.left = (8 + Math.random() * 84) + '%';
        var d = (5 + Math.random() * 5).toFixed(2);
        s.style.animationDuration = d + 's'; s.style.animationDelay = (-Math.random() * d) + 's';
        if (bubble) { s.style.background = 'radial-gradient(circle at 35% 30%, rgba(255,255,255,.95), rgba(180,220,240,.3) 60%, rgba(180,220,240,0))'; s.style.boxShadow = '0 0 4px rgba(160,205,225,.5)'; }
        else if (kind === 'dust') { s.style.background = 'rgba(235,205,120,.9)'; s.style.boxShadow = '0 0 5px rgba(235,205,120,.7)'; }
        else { s.style.background = 'radial-gradient(circle at 35% 30%, rgba(255,210,140,.8), rgba(220,120,60,.25) 60%, rgba(220,120,60,0))'; s.style.boxShadow = '0 0 4px rgba(255,180,90,.5)'; }
        box.appendChild(s);
      }
    });
  }

  function wire(slot) {
    if (slot.dataset.wired) return;
    slot.dataset.wired = '1';
    var tilter = slot.querySelector('.sk-tilter'), flipper = slot.querySelector('.sk-flipper'), front = slot.querySelector('.sk-front');
    slot.addEventListener('mousemove', function (e) {
      var r = slot.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      tilter.style.transform = 'rotateX(' + ((0.5 - py) * 18).toFixed(2) + 'deg) rotateY(' + ((px - 0.5) * 18).toFixed(2) + 'deg)';
      if (front) { front.style.setProperty('--mx', (px * 100).toFixed(1) + '%'); front.style.setProperty('--my', (py * 100).toFixed(1) + '%'); }
    });
    slot.addEventListener('mouseleave', function () { tilter.style.transform = 'rotateX(0deg) rotateY(0deg)'; });
    flipper.addEventListener('click', function () { flipper.classList.toggle('sk-flipped'); });
  }

  function init(scope) {
    scope = scope || document;
    spawn(scope);
    scope.querySelectorAll('.sk-slot').forEach(wire);
  }

  /* ---- helpers ------------------------------------------------------------- */
  function standardDeck() {
    var d = [], suits = ['parrot', 'treasure', 'map', 'jollyroger'], i;
    suits.forEach(function (su) { for (i = 1; i <= 14; i++) d.push({ type: 'number', suit: su, rank: i }); });
    for (i = 0; i < 5; i++) d.push({ type: 'escape' });
    ['bendt', 'rosie', 'harry', 'juanita', 'rascal'].forEach(function (n) { d.push({ type: 'pirate', name: n }); });
    d.push({ type: 'mermaid', name: 'alyra' }, { type: 'mermaid', name: 'sirena' });
    d.push({ type: 'tigress' }, { type: 'skullking' });
    d.push({ type: 'kraken' }, { type: 'whitewhale' });
    return d;
  }

  var API = { createCard: createCard, cardHTML: cardHTML, renderDeck: renderDeck, init: init, standardDeck: standardDeck };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  root.SkullKing = API;
})(typeof window !== 'undefined' ? window : this);
