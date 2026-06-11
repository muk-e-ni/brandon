fetch('posts.json')
  .then(response => response.json())
  .then(posts => {
    const container = document.querySelector('.blog-list');
    posts.forEach(post => {
      const postHTML = `        <div class="blog-card">
          <img src="${post.image}" alt="${post.title}">
          <div class="blog-content">
            <h3>${post.title}</h3>
            <p class="date">${new Date(post.date).toDateString()}</p>
            <p>${post.excerpt}</p>
            <a href="${post.url}" class="read-more">Read More →</a>
          </div>
        </div>
      `;
      container.innerHTML += postHTML;
    });
  })
  .catch(error => console.error('Error loading posts:', error));
