let totalCount = 0;
let currentCount = 0;

async function submitForm(event) {
   event.preventDefault();
   const result = document.getElementById('result');
   const button = document.getElementById('submit-button');
   result.innerHTML = '<div class="spinner"></div>';
   result.style.display = 'block';
   button.style.display = 'none';

   const postUrl = document.getElementById('urls').value;
   totalCount = parseInt(document.getElementById('amounts').value);
   const cooldownTime = 20 * 60 * 1000;

   const lastUseTime = localStorage.getItem('lastUseTime');
   if (lastUseTime && (new Date().getTime() - new Date(lastUseTime).getTime()) < cooldownTime) {
      result.classList.add('error');
      result.innerHTML = 'You need to wait for 20 minutes before using the site again.';
      button.style.display = 'block';
      return;
   }

   try {
      const response = await fetch('/api/submit', {
         method: 'POST',
         body: JSON.stringify({
            cookie: document.getElementById('cookies').value,
            url: postUrl,
            amount: totalCount,
            interval: document.getElementById('intervals').value,
         }),
         headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (data.status === 200) {
         result.classList.add('success');
         result.innerHTML = 'Submitted successfully!';
         button.style.display = 'block';
         saveHistory(postUrl, totalCount);
         localStorage.setItem('lastUseTime', new Date().toISOString());
         updateProgress();
      } else {
         result.classList.add('error');
         result.innerHTML = 'Error: ' + data.error;
         button.style.display = 'block';
      }
   } catch (e) {
      console.error(e);
      result.classList.add('error');
      result.innerHTML = 'An error occurred. Please try again later.';
      button.style.display = 'block';
   }
}

function updateProgress() {
   currentCount = 0;
   document.getElementById('shareProgress').innerText = `0/${totalCount}`;
   const progressInterval = setInterval(() => {
      if (currentCount < totalCount) {
         currentCount++;
         document.getElementById('shareProgress').innerText = `${currentCount}/${totalCount}`;
      } else {
         clearInterval(progressInterval);
         document.getElementById('shareProgress').innerText = `${totalCount}/${totalCount}`;
      }
   }, 1000);
}

function showHistory() {
   document.getElementById('form-container').style.display = 'none';
   document.getElementById('historyContainer').style.display = 'block';
}

function backToForm() {
   document.getElementById('form-container').style.display = 'block';
   document.getElementById('historyContainer').style.display = 'none';
}

function saveHistory(url, count) {
   const historyLog = document.getElementById('historyLog');
   const historyEntry = document.createElement('div');
   historyEntry.classList.add('history-entry');
   historyEntry.innerHTML = `URL: <span class="url">${url}</span> - <span class="count">${count}</span> shares completed`;
   historyLog.appendChild(historyEntry);
}