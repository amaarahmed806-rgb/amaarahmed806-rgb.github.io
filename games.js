/* ===================== TAB SWITCHING ===================== */
function initTabs(){
  const btns = document.querySelectorAll('.tab-btn');
  btns.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      btns.forEach(b=>b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.target).classList.add('active');
    });
  });
}

/* ===================== WORD SEARCH ===================== */
const WS_WORDS = ["PUZZLE","LETTER","INKWELL","RIDDLE","CIPHER","TILE","QUEST","SCRIBE"];
const WS_SIZE = 10;

function wsBuildGrid(){
  const grid = Array.from({length:WS_SIZE},()=>Array(WS_SIZE).fill(null));
  const dirs = [[0,1],[1,0],[1,1],[-1,1]];

  WS_WORDS.forEach(word=>{
    let placed=false, attempts=0;
    while(!placed && attempts<200){
      attempts++;
      const dir = dirs[Math.floor(Math.random()*dirs.length)];
      const row0 = Math.floor(Math.random()*WS_SIZE);
      const col0 = Math.floor(Math.random()*WS_SIZE);
      const endRow = row0 + dir[0]*(word.length-1);
      const endCol = col0 + dir[1]*(word.length-1);
      if(endRow<0||endRow>=WS_SIZE||endCol<0||endCol>=WS_SIZE) continue;

      let fits=true;
      for(let i=0;i<word.length;i++){
        const r=row0+dir[0]*i, c=col0+dir[1]*i;
        if(grid[r][c] !== null && grid[r][c] !== word[i]){ fits=false; break; }
      }
      if(!fits) continue;

      for(let i=0;i<word.length;i++){
        const r=row0+dir[0]*i, c=col0+dir[1]*i;
        grid[r][c]=word[i];
      }
      placed=true;
    }
  });

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for(let r=0;r<WS_SIZE;r++) for(let c=0;c<WS_SIZE;c++){
    if(!grid[r][c]) grid[r][c] = letters[Math.floor(Math.random()*letters.length)];
  }
  return grid;
}

let wsGrid, wsSelecting=false, wsSelection=[], wsFound=new Set();

function initWordSearch(){
  const el = document.getElementById('ws-grid');
  if(!el) return;
  wsGrid = wsBuildGrid();
  el.style.gridTemplateColumns = `repeat(${WS_SIZE}, 1fr)`;
  el.innerHTML='';
  for(let r=0;r<WS_SIZE;r++){
    for(let c=0;c<WS_SIZE;c++){
      const cell=document.createElement('div');
      cell.className='ws-cell';
      cell.textContent=wsGrid[r][c];
      cell.dataset.r=r; cell.dataset.c=c;
      cell.addEventListener('pointerdown', ()=>wsStart(cell));
      cell.addEventListener('pointerenter', ()=>wsDrag(cell));
      el.appendChild(cell);
    }
  }
  document.addEventListener('pointerup', wsEnd);

  const list=document.getElementById('ws-wordlist');
  list.innerHTML = WS_WORDS.map(w=>`<span data-w="${w}">${w}</span>`).join('');
  wsFound = new Set();
  document.getElementById('ws-status').textContent = `0 / ${WS_WORDS.length} found`;
  document.getElementById('ws-win').classList.remove('show');
}

function wsStart(cell){ wsSelecting=true; wsSelection=[cell]; cell.classList.add('selected'); }
function wsDrag(cell){
  if(!wsSelecting) return;
  if(!wsSelection.includes(cell)){
    wsSelection.push(cell);
    cell.classList.add('selected');
  }
}
function wsEnd(){
  if(!wsSelecting) return;
  wsSelecting=false;
  const str = wsSelection.map(c=>c.textContent).join('');
  const rev = str.split('').reverse().join('');
  const hit = WS_WORDS.find(w=> (w===str||w===rev) && !wsFound.has(w));
  if(hit){
    wsFound.add(hit);
    wsSelection.forEach(c=>{ c.classList.remove('selected'); c.classList.add('found'); });
    const tag = document.querySelector(`#ws-wordlist span[data-w="${hit}"]`);
    if(tag) tag.classList.add('done');
    document.getElementById('ws-status').textContent = `${wsFound.size} / ${WS_WORDS.length} found`;
    if(wsFound.size === WS_WORDS.length){
      document.getElementById('ws-win').classList.add('show');
    }
  } else {
    wsSelection.forEach(c=>c.classList.remove('selected'));
  }
  wsSelection=[];
}

/* ===================== SCRAMBLE ===================== */
const SCRAMBLE_WORDS = [
  {word:"PUZZLE", hint:"A game that tests your problem-solving"},
  {word:"KEYBOARD", hint:"You type on this"},
  {word:"LANTERN", hint:"A portable light, often carried at night"},
  {word:"HORIZON", hint:"Where the sky seems to meet the land"},
  {word:"WHISPER", hint:"A very quiet way of speaking"},
  {word:"COMPASS", hint:"Points you toward north"},
];
let scrIndex=0, scrScore=0;

function shuffleWord(w){
  let arr=w.split('');
  do{
    for(let i=arr.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [arr[i],arr[j]]=[arr[j],arr[i]];
    }
  } while(arr.join('')===w && w.length>1);
  return arr.join('');
}

function loadScramble(){
  const item = SCRAMBLE_WORDS[scrIndex % SCRAMBLE_WORDS.length];
  document.getElementById('scr-word').textContent = shuffleWord(item.word);
  document.getElementById('scr-hint').textContent = "Hint: " + item.hint;
  document.getElementById('scr-input').value='';
  document.getElementById('scr-feedback').textContent='';
  document.getElementById('scr-score').textContent = `Score: ${scrScore}`;
}

function initScramble(){
  const form = document.getElementById('scr-form');
  if(!form) return;
  scrIndex=0; scrScore=0;
  loadScramble();
  form.addEventListener('submit', e=>{
    e.preventDefault();
    const guess = document.getElementById('scr-input').value.trim().toUpperCase();
    const answer = SCRAMBLE_WORDS[scrIndex % SCRAMBLE_WORDS.length].word;
    const fb = document.getElementById('scr-feedback');
    if(guess === answer){
      scrScore++;
      fb.style.color = 'var(--gold)';
      fb.textContent = 'Correct! Next word coming up…';
      scrIndex++;
      setTimeout(loadScramble, 900);
    } else {
      fb.style.color = 'var(--crimson)';
      fb.textContent = 'Not quite — try again.';
    }
  });
  document.getElementById('scr-skip').addEventListener('click', ()=>{ scrIndex++; loadScramble(); });
}

/* ===================== QUIZ ===================== */
const QUIZ = [
  {q:"Which word game classic uses a 15x15 grid and letter tiles with point values?", opts:["Scrabble","Boggle","Hangman","Bingo"], a:0},
  {q:"In crosswords, a clue marked '(abbr.)' means the answer is:", opts:["A synonym","An abbreviation","A homophone","An anagram"], a:1},
  {q:"What do you call a word puzzle where letters of one word are rearranged to form another?", opts:["Acrostic","Palindrome","Anagram","Rebus"], a:2},
  {q:"A word or phrase that reads the same backward as forward is a:", opts:["Anagram","Palindrome","Pangram","Acronym"], a:1},
  {q:"Which puzzle uses numbers 1-9 in a 9x9 grid with no repeats per row, column, or box?", opts:["Kakuro","Sudoku","Nonogram","KenKen"], a:1},
];
let quizIndex=0, quizScore=0;

function loadQuiz(){
  const item = QUIZ[quizIndex];
  const qEl = document.getElementById('quiz-q');
  const optsEl = document.getElementById('quiz-opts');
  document.getElementById('quiz-progress').textContent = `Question ${quizIndex+1} / ${QUIZ.length}`;
  document.getElementById('quiz-score').textContent = `Score: ${quizScore}`;
  document.getElementById('quiz-win').classList.remove('show');

  if(!item){
    qEl.textContent = "Quiz complete!";
    optsEl.innerHTML='';
    document.getElementById('quiz-win').classList.add('show');
    document.getElementById('quiz-win').textContent = `Final score: ${quizScore} / ${QUIZ.length}`;
    return;
  }
  qEl.textContent = item.q;
  optsEl.innerHTML = item.opts.map((o,i)=>`<button class="quiz-opt" data-i="${i}">${o}</button>`).join('');
  optsEl.querySelectorAll('.quiz-opt').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const i = Number(btn.dataset.i);
      optsEl.querySelectorAll('.quiz-opt').forEach(b=>b.disabled=true);
      if(i===item.a){
        btn.classList.add('correct');
        quizScore++;
      } else {
        btn.classList.add('wrong');
        optsEl.children[item.a].classList.add('correct');
      }
      setTimeout(()=>{ quizIndex++; loadQuiz(); }, 1100);
    });
  });
}

function initQuiz(){
  if(!document.getElementById('quiz-q')) return;
  quizIndex=0; quizScore=0;
  loadQuiz();
}

document.addEventListener('DOMContentLoaded', ()=>{
  initTabs();
  initWordSearch();
  initScramble();
  initQuiz();
});
