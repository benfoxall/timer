import { Dexie, liveQuery } from 'https://esm.sh/dexie@4.0.8';
import { html, LitElement, css } from 'https://esm.sh/lit@3.2.0';
import { repeat } from 'https://esm.sh/lit@3.2.0/directives/repeat.js';

// Initialize Dexie database
const db = new Dexie('times');
db.version(1).stores({
    events: '++id, time',
});

// Add event listener to the button
document.querySelector('button').addEventListener('click', () => {
    db.events.add({ time: Date.now() });
});

// Create a live query to observe changes in the events table
const eventsQuery = liveQuery(() => db.events.orderBy('time').reverse().toArray());

// Initialize date formatter
const dateFormatter = new Intl.DateTimeFormat(undefined, {
    timeStyle: 'short',
});

// Define the custom element
export class Times extends LitElement {
    static styles = css`
    li {
      list-style: none;
      margin: 0.2em;
    }
    input {
      background-color: rgba(255, 255, 255, 0.07);
      color: inherit;
      border: none;
      font-size: inherit;
      margin: 0.2em;
    }
  `;

    static properties = {
        times: { type: Array },
    };

    constructor() {
        super();
        this.times = [];
        this._subscription = null;
    }

    connectedCallback() {
        super.connectedCallback();
        // Subscribe to the live query
        this._subscription = eventsQuery.subscribe({
            next: (times) => (this.times = times),
        });
    }

    disconnectedCallback() {
        // Unsubscribe when the element is disconnected
        if (this._subscription) {
            this._subscription.unsubscribe();
        }
        super.disconnectedCallback();
    }

    render() {
        return html`
      <ul>
        ${repeat(
            this.times,
            (item) => item.id,
            (item) => html`
            <li>
              <label>
                ${dateFormatter.format(new Date(item.time))}
                <input
                  type="text"
                  .value=${item.label || ''}
                  @change=${(e) => db.events.update(item.id, { label: e.target.value })}
                />
              </label>
            </li>
          `
        )}
      </ul>
    `;
    }
}

customElements.define('timer-times', Times);
