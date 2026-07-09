# Nova Radio Player 🎧

A modern, dark-themed internet radio player built with pure HTML, CSS and JavaScript.

Nova Radio uses the Radio Browser API to search and play thousands of online radio stations directly in your browser.

## Features

- 🔎 Search internet radio stations
- 🌍 Filter stations by country
- 🎵 Filter stations by genre
- ▶️ Play and pause radio streams
- 🔊 Volume control
- ⭐ Save favorite stations locally
- 📥 Load more stations dynamically
- 📱 Responsive mobile-friendly design

## Technologies

- HTML5
- CSS3
- JavaScript
- Radio Browser API
- Browser localStorage

## Project Structure

```text
radio-player/
│
├── index.html
├── styles.css
├── script.js
└── README.md
```



## Website:


## API

This project uses the Radio Browser API.

Radio Browser provides a free database of internet radio stations.

API documentation:

https://api.radio-browser.info/

## Favorites

Favorite stations are saved using browser localStorage.

This means:

- No account is required.
- No database is needed.
- Favorites stay on the same browser and device.
- Works with static hosting.

## Browser Support

Works with modern browsers:

- Google Chrome
- Mozilla Firefox
- Microsoft Edge
- Safari

## Notes

Some radio stations may not work because:

- The stream is offline.
- The station removed its stream.
- The browser blocks the stream format.

This is caused by the radio stream itself, not by Nova Radio.

## License

This project is free to use and modify.

## Credits

Radio data provided by:

Radio Browser API

https://api.radio-browser.info/
