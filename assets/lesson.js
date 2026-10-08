/* EE6102 study site — shared behaviour: theme, TOC + progress, mini quizzes, steppers */
(function(){
  'use strict';
  var KEY='ee6102-study-v1';
  function load(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){return {}}}
  function save(s){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}}
  var S=load(); S.seen=S.seen||{}; S.quiz=S.quiz||{}; S.done=S.done||{};
  var page=document.body.getAttribute('data-page')||'';

  /* theme */
  var tb=document.querySelector('.themeb');
  function applyTheme(t){if(t)document.documentElement.setAttribute('data-theme',t);else document.documentElement.removeAttribute('data-theme');if(tb)tb.textContent=t==='dark'?'浅色':t==='light'?'深色':'主题'}
  applyTheme(S.theme);
  if(tb)tb.addEventListener('click',function(){var dark=S.theme?S.theme==='dark':matchMedia('(prefers-color-scheme: dark)').matches;S.theme=dark?'light':'dark';save(S);applyTheme(S.theme)});

  /* TOC */
  var secs=[].slice.call(document.querySelectorAll('section.sec'));
  var toc=document.querySelector('.toc ol');
  if(toc&&secs.length){
    secs.forEach(function(s,i){
      var h=s.querySelector('h2');if(!s.id)s.id='s'+(i+1);
      var li=document.createElement('li');var a=document.createElement('a');a.href='#'+s.id;
      var txt=h?h.cloneNode(true):null;if(txt){var n=txt.querySelector('.n');if(n)n.remove()}
      a.innerHTML='<span class="n">'+(i+1)+'</span><span>'+(txt?txt.textContent.trim():s.id)+'</span>';
      li.appendChild(a);toc.appendChild(li);
    });
    var links=[].slice.call(toc.querySelectorAll('a'));
    var seen=S.seen[page]=S.seen[page]||{};
    function paint(){var c=0;links.forEach(function(a,i){var d=!!seen[secs[i].id];a.classList.toggle('done',d);if(d)c++});var b=document.querySelector('.toc .bar i');if(b)b.style.width=(c/secs.length*100)+'%';var t=document.querySelector('.toc .pct');if(t)t.textContent=c+' / '+secs.length+' 节已读'}
    paint();
    if('IntersectionObserver' in window){
      var io=new IntersectionObserver(function(es){es.forEach(function(e){
        var i=secs.indexOf(e.target);if(i<0)return;
        if(e.isIntersecting){links.forEach(function(a){a.classList.remove('on')});links[i].classList.add('on')}
      })},{rootMargin:'-20% 0px -70% 0px'});
      secs.forEach(function(s){io.observe(s)});
      /* a section counts as read once its end scrolls into view */
      var io2=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){var s=e.target.parentNode;if(s&&s.id&&!seen[s.id]){seen[s.id]=1;save(S);paint()}}})});
      secs.forEach(function(s){var m=document.createElement('span');m.setAttribute('aria-hidden','true');s.appendChild(m);io2.observe(m)});
    }
  }

  /* mini quizzes */
  var L='ABCDE';
  [].slice.call(document.querySelectorAll('.check')).forEach(function(c,ci){
    var ans=+c.getAttribute('data-a');var id=page+'#'+ci;
    var opts=[].slice.call(c.querySelectorAll('.opt'));
    opts.forEach(function(o,i){o.innerHTML='<span class="b">'+L[i]+'</span><span>'+o.innerHTML+'</span>'});
    var cx=c.querySelector('.cx');var v=document.createElement('p');v.className='v';if(cx)cx.insertBefore(v,cx.firstChild);
    function reveal(pick){
      c.classList.add('done');
      opts.forEach(function(o,i){o.disabled=true;if(i===ans)o.classList.add('right');if(i===pick&&pick!==ans)o.classList.add('wrong')});
      v.className='v '+(pick===ans?'ok':'no');v.textContent=pick===ans?'✓ 答对了':'✗ 正确答案是 '+L[ans];
    }
    opts.forEach(function(o,i){o.addEventListener('click',function(){S.quiz[id]=i;save(S);reveal(i)})});
    if(S.quiz[id]!==undefined)reveal(S.quiz[id]);
  });
  var rs=document.querySelector('[data-reset-quiz]');
  if(rs)rs.addEventListener('click',function(){Object.keys(S.quiz).forEach(function(k){if(k.indexOf(page+'#')===0)delete S.quiz[k]});save(S);location.reload()});

  /* steppers */
  [].slice.call(document.querySelectorAll('.stepper')).forEach(function(sp){
    var st=[].slice.call(sp.querySelectorAll('.st'));var i=0;
    var ctr=sp.querySelector('.ctr'),pv=sp.querySelector('[data-prev]'),nx=sp.querySelector('[data-next]');
    function show(){st.forEach(function(s,j){s.classList.toggle('on',j===i)});if(ctr)ctr.textContent='第 '+(i+1)+' / '+st.length+' 步';if(pv)pv.disabled=i===0;if(nx)nx.disabled=i===st.length-1}
    if(pv)pv.addEventListener('click',function(){if(i>0){i--;show()}});
    if(nx)nx.addEventListener('click',function(){if(i<st.length-1){i++;show()}});
    show();
  });

  /* module done */
  var db=document.querySelector('[data-done]');
  if(db){function pd(){db.textContent=S.done[page]?'✓ 本模块已学完（点击取消）':'标记本模块已学完'}pd();db.addEventListener('click',function(){S.done[page]=!S.done[page];save(S);pd()})}

  /* index status */
  [].slice.call(document.querySelectorAll('[data-mod]')).forEach(function(el){
    var p=el.getAttribute('data-mod'),st=el.querySelector('.st');if(!st)return;
    var seenN=S.seen[p]?Object.keys(S.seen[p]).length:0;
    st.textContent=S.done[p]?'✓ 已学完':(seenN?'已读 '+seenN+' 节':st.textContent);
  });
  window.EE6102=window.EE6102||{};
})();
