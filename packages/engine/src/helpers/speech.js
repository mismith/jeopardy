export const speak = (text) => new Promise((resolve) => {
  const msg = new SpeechSynthesisUtterance(text);
  msg.addEventListener('end', resolve);
  window.speechSynthesis.speak(msg);
});

export const recognize = (timeout = 0) => {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.continuous = true;
  recognition.interimResults = true;

  if (timeout) {
    setTimeout(() => {
      recognition.stop();
    }, timeout);
  }

  return recognition;
};

export const listen = (timeout = 0) => {
  const recognition = recognize(timeout);

  const results = [];
  recognition.addEventListener('result', (event) => {
    Array.from(event.results).forEach((result) => {
      if (result.isFinal) {
        Array.from(result).forEach((alternative) => {
          const text = alternative.transcript.trim();
          if (!results.includes(text)) { // prevent duplicates
            results.push(text);

            recognition.dispatchEvent(new CustomEvent('utterance', {
              detail: text,
            }));
          }
        });
      }
    });
  });
  recognition.start();

  return recognition;
};

// export const listenOnce = (timeout = 0) => new Promise((resolve) => {
//   const recognition = recognize(timeout);

//   let text;
//   recognition.addEventListener('result', (event) => {
//     Array.from(event.results).forEach((result) => {
//       Array.from(result).forEach((alternative) => {
//         text = alternative.transcript.trim();
//       });

//       // end early if user has stopped speaking
//       if (result.isFinal) {
//         recognition.stop();
//       }
//     });
//   });
//   recognition.addEventListener('end', () => {
//     resolve(text || '');
//   });
//   recognition.start();
// });
