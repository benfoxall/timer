import { Dexie, liveQuery } from 'https://esm.sh/dexie@4.0.8'
import { html, LitElement, css } from 'https://esm.sh/lit@3.2.0';
import { repeat } from 'https://esm.sh/lit@3.2.0/directives/repeat.js';

const db = new Dexie('times')

db.version(1).stores({
    events: `++id, time`
})


document.querySelector('button').addEventListener('click', () => {
    db.events.add({
        time: new Date().getTime()
    })
})


const q = liveQuery(() =>
    db.events
        .orderBy('time', 'desc')
        .reverse()
        .toArray()
)

const date = new Intl.DateTimeFormat(undefined, {
    // dateStyle: 'short',
    timeStyle: 'short',
})

export class Times extends LitElement {
    static styles = css`
    li {
        list-style: none;
        margin: .2em;
    }
    input {
        background-color: #fff1;
        color: inherit;
        border: none;
        font-size: inherit;
        margin: .2em;
      }
  `;

    static get properties() {
        return {
            times: Object
        }
    }

    constructor() {
        super();
        this.times = []

        q.subscribe({
            next: (times) => this.times = times
        })
    }


    render() {
        return html`
        <ul>${repeat(this.times, t => t.id,
            item => html`<li>
                <label>
                ${date.format(new Date(item.time))}
                    <input type="text" .value=${item.label || ''} @change=${(e) =>
                    db.events.update(item.id, { label: e.target.value })
                } />
                </label>
            </li>`
        )}</ul>
        
        `;
    }
}
customElements.define('timer-times', Times);
