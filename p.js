class Presentation extends HTMLElement {
    constructor() {
    // Always call super first in constructor
        super();
        var shadow = this.attachShadow({mode: 'open'});
        var tmpl = document.querySelector('#presentation').content;
        var content = tmpl.cloneNode(true);

        shadow.appendChild(content);
        this.content = this.shadowRoot.querySelector('.content');

        this._onKeyPress = this._onKeyPress.bind(this);
        this._onResize = this._onResize.bind(this);
        this._prev = this._prev.bind(this);
        this._next = this._next.bind(this);
    }
    connectedCallback() {
        this.addEventListener('prev', this._prev);
        this.addEventListener('next', this._next);

        window.addEventListener('keypress', this._onKeyPress);
        window.addEventListener('resize', this._onResize);

    }
    disconnectedCallback() {
        this.removeEventListener('prev', this._prev);
        this.removeEventListener('next', this._next);

        window.removeEventListener('keypress', this._onKeyPress);
        window.removeEventListener('resize', this._onResize);
    }
    _onKeyPress(e) {
        if (e.code === 'KeyP' && e.shiftKey) {
            this.hasAttribute('overview') ? this.removeAttribute('overview') : this.setAttribute('overview', true);
        }
    }
    _prev() {
        var active = this._getActiveSlide(),
            slides = [...this.querySelectorAll('z-slide')],
            index = slides.indexOf(active),
            next = slides[Math.max(index - 1, 0)];
        this.go(active, next);
    }
    _next() {
        var active = this._getActiveSlide(),
            slides = [...this.querySelectorAll('z-slide')],
            index = slides.indexOf(active),
            next = slides[Math.min(index + 1, slides.length - 1)];
        this.go(active, next);
    }
    go(active, next) {
        if (active && next && next !== active) {
            active.removeAttribute('active');
            next.setAttribute('active', 'active');
            if (!this.hasAttribute('overview')) {
                this._scrollTo(next);
            }
        }    
    }
    _getActiveSlide() {
        return this.querySelector('z-slide[active]') ||
            this.querySelector('z-slide:first-child');
    }
    _scrollTo(node) {
        window.blur();
        this.content.scrollTop = node.offsetTop;
    }
    _onResize() {
        this._scrollTo(this._getActiveSlide());
    }

}
customElements.define('z-presentation', Presentation);
class Slide extends HTMLElement {
    static get observedAttributes() {
        return ['active'];
    }
    constructor() {
        // Always call super first in constructor
        super();
        var shadow = this.attachShadow({mode: 'open'});
        var tmpl = document.querySelector('#slide').content;
        var clone = tmpl.cloneNode(true);

        shadow.appendChild(clone);
        this.content = this.shadowRoot.querySelector('.content');

        this._step = 0;

        this._onKeyDown = this._onKeyDown.bind(this);
    }
    connectedCallback() {
        this._maxSteps = this.querySelectorAll('.step').length + 1;
        if (this.hasAttribute('active')) {
            this._lockFocus();
        }
    }
    disconnectedCallback() {
        if (this.hasAttribute('active')) {
            this._unlockFocus();
        }
    }
    
    attributeChangedCallback(name, oldVal, newVal) {
        if (name === 'active') {
            if (newVal) {
                this._lockFocus();
            } else {
                this._unlockFocus();
            }
        }
    }
     _onKeyDown(e) {
        var active,
            next;
        if (e.target.closest('z-slide') == this) {
            return;
        }
        switch (e.code) {
            case 'ArrowRight':
                this._step++;
                break;
            case 'ArrowLeft':
                this._step--;
                break;
        }
        if (this._step < 0) {
            this._step = 0;
            this.dispatchEvent(new Event('prev', {bubbles: true}));
        } else if (this._step >= this._maxSteps) {
            this._step = this._maxSteps - 1;
            this.dispatchEvent(new Event('next', {bubbles: true}));
        } else {
            this._setStep(this._step);
            } 
    }
    _setStep(step) {
        var steps = this.querySelectorAll('.step');
        this._maxSteps = steps.length + 1;
        steps.forEach((item, i) => {
            if (i < step) {
                item.removeAttribute('hidden');
            } else {
                item.setAttribute('hidden', 'hidden');
            }
        });
    }
    _lockFocus() {
        this._setStep(this._step);
        window.addEventListener('keydown', this._onKeyDown);
    }
    _unlockFocus() {
        window.removeEventListener('keydown', this._onKeyDown);
    }
}
customElements.define('z-slide', Slide);
class Lz77 extends HTMLElement {
    constructor() {
        // Always call super first in constructor
        super();
        var shadow = this.attachShadow({mode: 'open'});
        var tmpl = document.querySelector('#lz77').content;
        var clone = tmpl.cloneNode(true);

        shadow.appendChild(clone);
        this._input = this.shadowRoot.querySelector('.field');

        this._matchPadding = this.shadowRoot.querySelector('.match .padding');
        this._matchFrame = this.shadowRoot.querySelector('.match .frame');
        this._resPadding = this.shadowRoot.querySelector('.resmatch .padding');
        this._resFrame = this.shadowRoot.querySelector('.resmatch .frame');
        this._cursorPadding = this.shadowRoot.querySelector('.cursor .padding');
        this._cursorFrame = this.shadowRoot.querySelector('.cursor .frame');

        this._result = this.shadowRoot.querySelector('.result');

        this.content = this.shadowRoot.querySelector('.content');
        this._onKeyDown = this._onKeyDown.bind(this);

        this._onInputChange = this._onInputChange.bind(this);
        this._onPackResult = this._onPackResult.bind(this);
    }
    connectedCallback() {
        this.addEventListener('keydown', this._onKeyDown);

        if (this.hasAttribute('unpack')) {
            document.addEventListener('lz77', this._onPackResult);
        }

        this._input.addEventListener('change', this._onInputChange);
    }
    disconnectedCallback() {
        this.removeEventListener('keydown', this._onKeyDown);

        if (this.hasAttribute('unpack')) {
            document.removeEventListener('lz77', this._onPackResult);
        }

        this._input.removeEventListener('change', this._onInputChange);
    }
    _onPackResult(e) {
        this._input.value = JSON.stringify(e.res);
        this._onInputChange();
    }
    *getActionPack (str) {
        var i = 0,
            len = str.length,
            known = '',
            cursorStart = 0,
            cursorLength = 0,
            matchStart = 0,
            matchIndex = -1,
            matchLength = 0,
            res = [];
        for (i = 0; i < len; i++) {
            if (matchIndex !== -1) {
                // +1
                cursorLength++;
                this._cursor(cursorStart, cursorLength);
                yield;

                var newIndex = known.indexOf(str.slice(cursorStart, cursorStart + cursorLength));
            
                if (newIndex === -1) {
                    // res push
                    res.push(matchStart - matchIndex, matchLength);
                    this._resPush(res);
                    
                    //cursor reset
                    cursorStart = i;
                    cursorLength = 1;
                    this._cursor(cursorStart, cursorLength);

                    
                    // match reset
                    matchIndex = -1;
                    matchLength = 0;
                    this._match(matchIndex, matchLength);
                    yield;
                } else {
                    // match +1
                    matchIndex = newIndex;
                    matchLength = cursorLength;
                    this._match(matchIndex, matchLength);
                    yield;
                }
            } else {
                var nextchar = str[i];
                if (known.indexOf(nextchar) === -1) {
                    // +1
                    cursorLength++;
                    this._cursor(cursorStart, cursorLength);
                    yield;
                } else {
                    // res push
                    res.push(str.slice(cursorStart, cursorStart + cursorLength));
                    this._resPush(res);

                    //curreset
                    cursorStart = i;
                    cursorLength = 1;
                    this._cursor(cursorStart, cursorLength);
                    yield;
                    
                    //match reset
                    matchStart = i;
                    matchIndex = known.indexOf(nextchar);
                    matchLength = 1;
                    this._match(matchIndex, matchLength);
                    yield;
                }
            }
            known += str[i];
        }
        // res push
        if (matchIndex !== -1) {
            res.push(matchStart - matchIndex, matchLength);
        } else {
            res.push(str.slice(cursorStart, cursorStart + cursorLength));
        }
        this._resPush(res);

        matchIndex = -1;
        matchLength = 0;
        cursorStart = str.length;
        cursorLength = 0;
        //match reset
        this._match(matchIndex, matchLength);
        this._cursor(cursorStart, cursorLength);

        yield;
        return res;
    }
    *getActionUnpack (str) {
        var i = 0,
            tokens = JSON.parse(str),
            len = tokens.length,
            cursorStart = 0,
            cursorLength = 0,
            matchStart = 0,
            matchIndex = -1,
            matchLength = 0,
            res = '',
            toCursor = (i, k = i) => {
                let st = JSON.stringify(tokens.slice(0, i)).length;
                if (i < 1) {
                    st--;
                }
                let en = JSON.stringify(tokens.slice(0, k + 1)).length - 1;

                return [
                    st,
                    en - st
                ]
            };
        for (i = 0; i < len; i++) {
            var token = tokens[i];

            if (typeof token === 'string') {
                this._cursor(...toCursor(i));
                res += token;
            } else {
                var offset = res.length - token,
                    length = tokens[++i];

                this._cursor(...toCursor(i - 1, i));
                
                this._matchres(offset, offset + length);
                yield;

                while (length) {
                    res += res.slice(offset, offset + 1);
                    offset++;
                    length--;
                }
                

            }
            this._resPush([res]);
            this._matchres(-1, 0);
            yield;
        }

        yield;
        return res;
    }
    _dict(dict) {
        var str = Object.keys(dict).map(key => {
            return '<li>' + key + dict[key] + '</li>';
        });
        this._dict.innerHTML = str;
    }
    _resPush(res) {
        this._result.innerText = res.join();
        if (!this.hasAttribute('unpack')) {
            var e = new Event('lz77', {
                bubbles: true
            });
            e.res = res;
            this.dispatchEvent(e);
        }
    }

    _match(start, end) {
        var str = this._input.value,
            padding = str.slice(0, start),
            frame = str.slice(start, start + end);
        if (start === -1) {
            padding = '';
            frame = '';
        }
        this._matchPadding.innerText = padding;
        this._matchFrame.innerText = frame;
    }
    _matchres(start, end) {
        var str = this._result.innerText,
            padding = str.slice(0, start),
            frame = str.slice(start, start + end);
        if (start === -1) {
            padding = '';
            frame = '';
        }
        this._resPadding.innerText = padding;
        this._resFrame.innerText = frame;
    }
    _cursor(start, end) {
        var str = this._input.value;
        this._cursorPadding.innerText = str.slice(0, start);
        this._cursorFrame.innerText = str.slice(start, start + end);
    }

    _onInputChange () {
        this._resPush([]);
        this._match(-1, 0);
        this._cursor(0, 0);
        if (this.hasAttribute('unpack')) {
            this.action = this.getActionUnpack(this._input.value);
        } else {
            this.action = this.getActionPack(this._input.value);
        }
    }
    _onKeyDown(e) {
        var active,
            next,
            isArrows;

        if (this.action && e.code === 'Enter') {
            e.stopPropagation();
            this.action.next();
        }  
    }
}
customElements.define('z-lz77', Lz77);

class Lzw extends HTMLElement {
    constructor() {
        // Always call super first in constructor
        super();
        var shadow = this.attachShadow({mode: 'open'});
        var tmpl = document.querySelector('#lzw').content;
        var clone = tmpl.cloneNode(true);

        shadow.appendChild(clone);
        this._input = this.shadowRoot.querySelector('.field');

        this._matchPadding = this.shadowRoot.querySelector('.match .padding');
        this._matchFrame = this.shadowRoot.querySelector('.match .frame');
        this._resPadding = this.shadowRoot.querySelector('.resmatch .padding');
        this._resFrame = this.shadowRoot.querySelector('.resmatch .frame');
        this._cursorPadding = this.shadowRoot.querySelector('.cursor .padding');
        this._cursorFrame = this.shadowRoot.querySelector('.cursor .frame');

        this._result = this.shadowRoot.querySelector('.result');
        this._dict = this.shadowRoot.querySelector('.dict');

        this.content = this.shadowRoot.querySelector('.content');
        this._onKeyDown = this._onKeyDown.bind(this);

        this._onInputChange = this._onInputChange.bind(this);
        this._onPackResult = this._onPackResult.bind(this);
    }
    connectedCallback() {
        this.addEventListener('keydown', this._onKeyDown);

        if (this.hasAttribute('unpack')) {
            document.addEventListener('lzw', this._onPackResult);
        }

        this._input.addEventListener('change', this._onInputChange);
    }
    disconnectedCallback() {
        this.removeEventListener('keydown', this._onKeyDown);

        if (this.hasAttribute('unpack')) {
            document.removeEventListener('lzw', this._onPackResult);
        }

        this._input.removeEventListener('change', this._onInputChange);
    }
    _onPackResult(e) {
        this._input.value = JSON.stringify(e.res);
        this._onInputChange();
    }
    *getActionPack (str) {
        var i = 0,
            len = str.length,
            dict = {},
            res = [],
            capacity = 0,
            curDictIndex = -1,
            cursorIndex = 0,
            cursorLength = 0;

        this._dictPush(dict);

        for (i = 0; i < len; i++) {
            cursorLength++;
            this._cursor(cursorIndex, cursorLength);
            yield;

            var slice = str.slice(cursorIndex, cursorIndex + cursorLength);
            if (slice.length === 1) {
                curDictIndex = slice;
            } else if (slice in dict) {
                curDictIndex = dict[slice];
            } else {
                dict[slice] = capacity++;
                this._dictPush(dict);
                yield;

                res.push(curDictIndex);
                this._resPush(res);

                curDictIndex = str[i];
                cursorIndex = i;
                cursorLength = 1;
                this._cursor(cursorIndex, cursorLength);
            }

            yield;
        }

        if (curDictIndex !== -1) {
            res.push(curDictIndex);
            this._resPush(res);
        }

        this._dictPush(dict);

        cursorIndex = i;
        cursorLength = 0;
        this._cursor(cursorIndex, cursorLength);
        yield;
    }
    *getActionUnpack (str) {
        var i = 0,
            tokens = JSON.parse(str),
            len = tokens.length,
            res = '',
            dict = [],
            capacity = 0,
            curDictIndex = -1,
            cursorIndex = 0,
            cursorLength = 0,
            dictIndex = 0,
            toDict = () => {
                return dict.reduce((obj, item) => {
                    obj[item] = 1;
                    return obj;
                }, {});
            },
            getToken = i => {
                let token = tokens[i];
                if (typeof token !== 'string') {
                    token = dict[token];
                    if (!token) {
                        token = getToken(i - 1);
                        token += token.slice(0, 1);
                        this._dictPush(toDict());
                    }
                }
                return token;
            },
            toCursor = (i) => {
                let st = JSON.stringify(tokens.slice(0, i)).length;
                if (i < 1) {
                    st--;
                }
                let en = JSON.stringify(tokens.slice(0, i + 1)).length - 1;

                return [
                    st,
                    en - st
                ]
            }

        this._dictPush(dict);

        var prevToken;
        for (i = 0; i < len; i++) {
            var token = getToken(i);
            this._cursor(...toCursor(i));
            yield;

            res += token;
            this._resPush([res]);
            yield;

            if (prevToken) {
                var part = prevToken + token;
                var key,
                    rowLen = 1,
                    dictObj = toDict();
                do {
                    rowLen++;
                    key = part.slice(0, rowLen);
                    this._matchres(res.length - part.length, rowLen);
                    yield;
                } while(key.length === rowLen && dictObj.hasOwnProperty(key));

                if (key.length === rowLen) {
                    dict.push(key);
                    dictIndex += key.length - 1;
                    this._dictPush(toDict());
                } else {
                    alert('Случилась лажа');
                }

                this._matchres(-1, 0);

                yield;
            }
            prevToken = token;
            
        }
    }
    _dictPush(dict) {
        var str = Object.keys(dict).map(key => {
                return [dict[key], '<li>' + key + '</li>'];
            })
            .sort((a, b) => a[0] > b[0])
            .map(a => a[1])
            .join('');
        this._dict.innerHTML = str;
    }
    _resPush(res) {
        this._result.innerText = res.join();
        if (!this.hasAttribute('unpack')) {
            var e = new Event('lzw', {
                bubbles: true
            });
            e.res = res;
            this.dispatchEvent(e);
        }
    }

    _match(start, end) {
        var str = this._input.value,
            padding = str.slice(0, start),
            frame = str.slice(start, start + end);
        if (start === -1) {
            padding = '';
            frame = '';
        }
        this._matchPadding.innerText = padding;
        this._matchFrame.innerText = frame;
    }

    _matchres(start, end) {
        var str = this._result.innerText,
            padding = str.slice(0, start),
            frame = str.slice(start, start + end);
        if (start === -1) {
            padding = '';
            frame = '';
        }
        this._resPadding.innerText = padding;
        this._resFrame.innerText = frame;
    }
    _cursor(start, end) {
        var str = this._input.value;
        this._cursorPadding.innerText = str.slice(0, start);
        this._cursorFrame.innerText = str.slice(start, start + end);
    }

    _onInputChange () {
        this._resPush([]);
        this._match(-1, 0);
        this._cursor(0, 0);
        if (this.hasAttribute('unpack')) {
            this.action = this.getActionUnpack(this._input.value);
        } else {
            this.action = this.getActionPack(this._input.value);
        }
    }
    _onKeyDown(e) {
        var active,
            next,
            isArrows;

        if (this.action && e.code === 'Enter') {
            e.stopPropagation();
            this.action.next();
        }  
    }
}
customElements.define('z-lzw', Lzw);

class Lzdiff extends HTMLElement {
    constructor() {
        // Always call super first in constructor
        super();
        var shadow = this.attachShadow({mode: 'open'});
        var tmpl = document.querySelector('#lzdiff').content;
        var clone = tmpl.cloneNode(true);

        shadow.appendChild(clone);
        this._input = this.shadowRoot.querySelector('.input .field');
        this._output = this.shadowRoot.querySelector('.output .field');

        this._matchPadding = this.shadowRoot.querySelector('.match .padding');
        this._matchFrame = this.shadowRoot.querySelector('.match .frame');
        this._cursorPadding = this.shadowRoot.querySelector('.cursor .padding');
        this._cursorFrame = this.shadowRoot.querySelector('.cursor .frame');

        this._result = this.shadowRoot.querySelector('.result');

        this.content = this.shadowRoot.querySelector('.content');
        this._onKeyDown = this._onKeyDown.bind(this);

        this._onInputChange = this._onInputChange.bind(this);
    }
    connectedCallback() {
        this.addEventListener('keydown', this._onKeyDown);

        this._input.addEventListener('change', this._onInputChange);
        this._output.addEventListener('change', this._onInputChange);
    }
    disconnectedCallback() {
        this.removeEventListener('keydown', this._onKeyDown);

        this._input.removeEventListener('change', this._onInputChange);
        this._output.removeEventListener('change', this._onInputChange);
    }
    *getAction (known, str) {
        var i = 0,
            len = str.length,
            klen = known.length,
            cursorStart = 0,
            cursorLength = 0,
            matchStart = -1,
            matchLength = 0,
            res = [];
        for (i = 0; i < len; i++) {
            if (matchStart !== -1) {
                // +1
                cursorLength++;
                this._cursor(cursorStart, cursorLength);
                yield;

                var newIndex = known.indexOf(str.slice(cursorStart, cursorStart + cursorLength));
            
                if (newIndex === -1) {
                    // res push
                    res.push(matchStart, matchLength);
                    this._resPush(res);
                    
                    //cursor reset
                    cursorStart = i;
                    cursorLength = 1;
                    this._cursor(cursorStart, cursorLength);

                    
                    // match reset
                    matchStart = -1;
                    matchLength = 0;
                    this._match(matchStart, matchLength);
                    yield;
                } else {
                    // match +1
                    matchStart = newIndex;
                    matchLength = cursorLength;
                    this._match(matchStart, matchLength);
                    yield;
                }
            } else {
                var nextchar = str[i];
                if (known.indexOf(nextchar) === -1) {
                    // +1
                    cursorLength++;
                    this._cursor(cursorStart, cursorLength);
                    yield;
                } else {
                    if (cursorLength) {
                        // res push
                        res.push(str.slice(cursorStart, cursorStart + cursorLength));
                        this._resPush(res);
                    }

                    //curreset
                    cursorStart = i;
                    cursorLength = 1;
                    this._cursor(cursorStart, cursorLength);
                    yield;
                    
                    //match reset
                    matchStart = known.indexOf(nextchar);
                    matchLength = 1;
                    this._match(matchStart, matchLength);
                    yield;
                }
            }
        }
        // res push
        if (matchStart !== -1) {
            res.push(matchStart, matchLength);
        } else if (cursorLength) {
            res.push(str.slice(cursorStart, cursorStart + cursorLength));
        }
        this._resPush(res);

        matchStart = -1;
        matchLength = 0;
        cursorStart = str.length;
        cursorLength = 0;
        //match reset
        this._match(matchStart, matchLength);
        this._cursor(cursorStart, cursorLength);

        yield;
        return res;
    }
    _dict(dict) {
        var str = Object.keys(dict).map(key => {
            return '<li>' + key + dict[key] + '</li>';
        });
        this._dict.innerHTML = str;
    }
    _resPush(res) {
        this._result.innerText = res.join();
    }

    _match(start, end) {
        var str = this._input.value,
            padding = str.slice(0, start),
            frame = str.slice(start, start + end);
        if (start === -1) {
            padding = '';
            frame = '';
        }
        this._matchPadding.innerText = padding;
        this._matchFrame.innerText = frame;
    }
    _cursor(start, end) {
        var str = this._input.value;
        this._cursorPadding.innerText = str.slice(0, start);
        this._cursorFrame.innerText = str.slice(start, start + end);
    }

    _onInputChange () {
        this._resPush([]);
        this._match(-1, 0);
        this._cursor(0, 0);
        this.action = this.getAction(this._input.value, this._output.value);
    }
    _onKeyDown(e) {
        var active,
            next,
            isArrows;

        if (this.action && e.code === 'Enter') {
            e.stopPropagation();
            this.action.next();
        }  
    }
}
customElements.define('z-lzdiff', Lzdiff);