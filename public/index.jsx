import { h, render, Component } from "./lib/preact.js";

/** @jsx h */

/* global lunr:readonly */

document.addEventListener("DOMContentLoaded", () => {
  const resultsSection = document.getElementById("search-results");
  class Search extends Component {
    search(event) {
      event.preventDefault();
      saveData();
      render(<Results />, resultsSection);
    }
    render() {
      return (
        <div>
          <form
            className="d-inline-flex mt-5 w-50 m-auto"
            onSubmit={this.search}
            autoComplete="off"
          >
            <div className="d-inline-flex me-2 pe-lg-2 ps-2 rounded-pill purple-gradient border-0 w-100 t-light align-items-center">
              <label htmlFor="toggleFuzzySearch">
                <input
                  type="checkbox"
                  id="toggleFuzzySearch"
                  className="totally-invisible"
                  checked
                />
                <span
                  className="iconify ms-3"
                  data-icon="clarity:asterisk-solid"
                  data-inline="false"
                  title="Enable fuzzy search"
                  aria-label="Enable fuzzy search"
                  id="toggleFuzzySearchIcon"
                ></span>
              </label>
              <input
                type="text"
                aria-label="Search"
                id="search-box"
                className="d-flex p-2 ps-4 pe-5 rounded-pill bg-transparent border-0 flex-fill text-light"
              />
            </div>
            <button
              className="d-flex rounded-circle purple-gradient border-0"
              type="submit"
            >
              <svg
                className="position-relative m-2"
                width="33"
                height="37"
                fill="none"
                transform="scale(0.7)"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M18.609 21.425c4.351-2.88 5.477-8.844 2.515-13.32-2.963-4.476-8.892-5.77-13.244-2.89-4.352 2.88-5.478 8.845-2.516 13.32 2.963 4.477 8.893 5.77 13.245 2.89zm-2.17-3.278c-2.592 1.715-6.123.945-7.887-1.72-1.765-2.666-1.094-6.218 1.497-7.933 2.592-1.716 6.123-.945 7.888 1.72 1.764 2.666 1.093 6.218-1.498 7.933zm3.395 4.64a2.7 2.7 0 00-.762 3.74l2.268 3.427a2.7 2.7 0 104.503-2.98l-2.268-3.426a2.7 2.7 0 00-3.741-.761z"
                  fill="#FAFAFA"
                />
              </svg>
            </button>
          </form>
        </div>
      );
    }
  }

  class Results extends Component {
    constructor(props) {
      super(props);
      this.state = { loaded: 0, comments: null };
      this.searchBox = document.getElementById("search-box");
    }
    componentDidMount() {
      this.footer = document.querySelector("footer");
      this.fuzzySearchToggler = document.getElementById("toggleFuzzySearch");
      fetch("https://scratchdata.slylittlefox.repl.co/comments/lunr")
        .then((r) => r.json())
        .then((index) => {
          this.index = lunr.Index.load(index);
          fetch("https://scratchdata.slylittlefox.repl.co/comments")
            .then((r) => r.json())
            .then((comments) => {
              this.comments = comments;
              this.setState(() => ({
                loaded: true,
              }));
            });
        });
    }
    /**
     *
     * @returns {object[]}
     */
    search() {
      if (this.fuzzySearchToggler.checked) {
        return this.index
          .search(this.searchBox.value)
          .filter((e) => e.score >= 0.25)
          .map((e) => this.comments[e.ref]);
      } else {
        return this.comments.filter((c) =>
          c.content.includes(this.searchBox.value)
        );
      }
    }
    render() {
      if (this.state.loaded) {
        resultsSection.innerHTML = "";
        const found = this.search();
        render(<Footer results={found.length} />, this.footer);
        const results = (
          <div className="d-inline-flex flex-wrap">
            {found.slice(0, 100).map((comment) => {
              return (
                <a href={comment.link} key="comment">
                  <div className="card m-1 p-1 flex-fill text-start fade-in text-wrap text-break text-black">
                    <div className="card-body">
                      <a href={`https://scratch.mit.edu/users/${comment.user}`}>
                        <h5 className="card-title">{comment.user}</h5>
                      </a>
                      <h6 className="card-subtitle mb-2 text-secondary">
                        On{" "}
                        <a
                          href={`https://scratch.mit.edu/users/${comment.profile}`}
                        >
                          {comment.profile}&lsquo;s profile
                        </a>
                      </h6>
                      <p className="card-text">{htmlDecode(comment.content)}</p>
                    </div>
                  </div>
                </a>
              );
            })}
            <nav aria-label="Page navigation example">
              <ul className="pagination">
                <li className="page-item">
                  <a className="page-link" href="#">
                    <span
                      className="iconify"
                      data-icon="bi:caret-left-fill"
                      data-inline="false"
                    ></span>
                  </a>
                </li>
                <li className="page-item">
                  <a className="page-link" href="#">
                    1
                  </a>
                </li>
                <li className="page-item">
                  <a className="page-link" href="#">
                    2
                  </a>
                </li>
                <li className="page-item">
                  <a className="page-link" href="#">
                    3
                  </a>
                </li>
                <li className="page-item">
                  <a className="page-link" href="#">
                    Next
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        );
        return results;
      } else {
        return (
          <div
            className="spinner-grow purple-gradient mt-5 m-auto"
            role="status"
          >
            <span className="visually-hidden">Searching...</span>
          </div>
        );
      }
    }
  }

  class Footer extends Component {
    static get propTypes() {
      return { results: "" };
    }
    render() {
      return (
        <span>
          Found {this.props.results} results.
          {this.props.results > 1000 ? "Showing only the first 100." : ""}
        </span>
      );
    }
  }

  class ThemeSwitcher extends Component {
    constructor(props) {
      super(props);
      this.state = { dark: false };
    }

    switchTheme(e) {
      e.stopPropagation();
      if (
        e.target.nodeName.toUpperCase() !== "INPUT" ||
        e.target.type.toLowerCase() !== "checkbox"
      )
        return;
      this.setState(() => ({
        dark: e.target.checked,
      }));
      document.documentElement.style.setProperty(
        "--light",
        this.state.dark ? "#f8f9fa" : "black"
      );
      document.documentElement.style.setProperty(
        "--black",
        this.state.dark ? "black" : "#f8f9fa"
      );
    }

    render() {
      if (this.state.dark) {
        return (
          <label
            htmlFor="theme-switcher-checkbox"
            onClick={this.switchTheme.bind(this)}
          >
            <input
              type="checkbox"
              id="theme-switcher-checkbox"
              className="totally-invisible"
            />
            <div className="b-black theme-switcher d-flex align-items-center justify-content-center position-absolute">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                width="1em"
                height="1em"
                style="-ms-transform:rotate(360deg);-webkit-transform:rotate(360deg)"
                viewBox="0 0 128 128"
                transform="rotate(360)"
              >
                <g fill="#fcc21b">
                  <path d="M64 30.34c-18.59 0-33.66 15.07-33.66 33.65 0 18.59 15.07 33.66 33.66 33.66 18.59 0 33.66-15.07 33.66-33.66 0-18.58-15.07-33.65-33.66-33.65zM56.76 24.21h14.49c.67 0 1.29-.33 1.68-.88.38-.54.47-1.25.24-1.88L65.92 1.83C65.62 1.02 64.86.49 64 .49s-1.62.54-1.92 1.34l-7.25 19.63c-.23.63-.14 1.33.24 1.88.39.55 1.02.87 1.69.87zM97.26 40.99c.38.39.91.6 1.44.6.12 0 .24-.01.36-.03.66-.12 1.21-.55 1.5-1.16l8.76-19.01c.36-.78.19-1.69-.41-2.3-.61-.61-1.53-.77-2.31-.42l-19 8.77c-.61.28-1.04.84-1.16 1.5-.12.66.1 1.33.56 1.81l10.26 10.24zM126.18 62.08l-19.64-7.24c-.63-.23-1.33-.14-1.88.24-.55.38-.87 1-.87 1.67l.01 14.49c0 .67.33 1.3.88 1.68.35.23.76.36 1.17.36.24 0 .48-.04.71-.13l19.64-7.24c.8-.29 1.34-1.06 1.34-1.93-.02-.84-.55-1.6-1.36-1.9zM100.56 87.6a2.05 2.05 0 00-1.5-1.16c-.66-.11-1.34.1-1.8.57L87.01 97.26c-.47.47-.69 1.15-.57 1.81.12.65.55 1.22 1.16 1.5l19.01 8.76c.27.13.56.18.86.18.53 0 1.05-.21 1.44-.6.61-.61.77-1.52.41-2.3l-8.76-19.01zM71.24 103.78l-14.49.01c-.67 0-1.29.33-1.67.88-.38.55-.47 1.25-.25 1.87l7.25 19.64c.3.8 1.06 1.34 1.92 1.34s1.62-.54 1.92-1.34l7.25-19.64c.23-.63.14-1.33-.24-1.88-.39-.55-1.01-.88-1.69-.88zM30.74 87.01c-.47-.47-1.14-.68-1.8-.57-.66.12-1.22.55-1.5 1.16l-8.76 19.01c-.36.78-.19 1.7.42 2.3a2.038 2.038 0 002.3.41l19.01-8.77a2.05 2.05 0 001.16-1.5c.12-.66-.1-1.33-.57-1.8L30.74 87.01zM22.17 73.29c.41 0 .82-.13 1.17-.37.55-.38.88-1.01.88-1.68l-.01-14.49a2.045 2.045 0 00-2.75-1.92L1.82 62.08a2.045 2.045 0 000 3.84l19.65 7.24c.23.09.46.13.7.13zM27.45 40.4a2.05 2.05 0 003.31.59L41 30.74c.47-.48.68-1.15.56-1.81-.12-.65-.55-1.21-1.16-1.49l-19.02-8.76c-.78-.36-1.69-.19-2.3.42-.61.61-.77 1.52-.41 2.3l8.78 19z" />
                </g>
                <path fill="rgba(0, 0, 0, 0)" d="M0 0h128v128H0z" />
              </svg>
            </div>
          </label>
        );
      } else {
        return (
          <label
            htmlFor="theme-switcher-checkbox"
            onClick={this.switchTheme.bind(this)}
          >
            <input
              type="checkbox"
              id="theme-switcher-checkbox"
              className="totally-invisible"
            />
            <div className="b-black theme-switcher d-flex align-items-center justify-content-center position-absolute">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                width="1em"
                height="1em"
                style="-ms-transform:rotate(360deg);-webkit-transform:rotate(360deg)"
                viewBox="0 0 48 48"
                transform="rotate(360)"
              >
                <path fill="#673AB7" d="M16.5 18L0 42h33z" />
                <path fill="#9575CD" d="M33.6 24L19.2 42H48z" />
                <path
                  fill="#40C4FF"
                  d="M42.9 6.3C43.6 7.4 44 8.6 44 10c0 3.9-3.1 7-7 7-.7 0-1.3-.1-1.9-.3 1.2 2 3.4 3.3 5.9 3.3 3.9 0 7-3.1 7-7 0-3.2-2.1-5.9-5.1-6.7z"
                />
                <path fill="rgba(0, 0, 0, 0)" d="M0 0h48v48H0z" />
              </svg>
            </div>
          </label>
        );
      }
    }
  }

  const searchSection = document.getElementById("search");
  const themeSwitcherSection = document.getElementById("theme-switcher");
  render(<Search />, searchSection);
  render(<ThemeSwitcher />, themeSwitcherSection);
});

function saveData(index, data) {
  let openRequest = indexedDB.open("store", 1);

  // создаём хранилище объектов для books, если ешё не существует
  openRequest.onupgradeneeded = function () {
    let db = openRequest.result;
    if (!db.objectStoreNames.contains("data")) {
      // если хранилище "data" не существует
      db.createObjectStore("data"); // создаем хранилище
    }
    if (!db.objectStoreNames.contains("index")) {
      // если хранилище "data" не существует
      db.createObjectStore("index"); // создаем хранилище
    }
  };

  openRequest.onerror = function () {
    console.error("Error", openRequest.error);
  };

  openRequest.onsuccess = function () {
    const db = openRequest.result;
    let transaction = db.transaction("data", "readwrite"); // (1)

    // получить хранилище объектов для работы с ним
    let data = transaction.objectStore("data"); // (2)

    let book = {
      id: "a",
      price: 10,
      created: new Date(),
    };

    let request = data.add(book); // (3)

    request.onsuccess = function () {
      // (4)
      console.log("Книга добавлена в хранилище", request.result);
    };

    request.onerror = function () {
      console.log("Ошибка", request.error);
    };
  };
}

function htmlDecode(input) {
  const doc = new DOMParser().parseFromString(input, "text/html");
  return doc.documentElement.textContent;
}
