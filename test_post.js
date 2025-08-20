// Quick test to create a new post
const response = await fetch('http://localhost:5000/api/posts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Cookie': 'connect.sid=your_session_id' // This would need the actual session
  },
  body: JSON.stringify({
    content: 'Test post from script - checking if posts are working!'
  })
});

const result = await response.json();
console.log('Post creation result:', result);

// Then check the feed
const feedResponse = await fetch('http://localhost:5000/api/posts/feed');
const feedData = await feedResponse.json();
console.log('Feed data (first post):', feedData[0]);