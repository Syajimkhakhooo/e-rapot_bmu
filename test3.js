const url = 'https://ckgxhqesynukzdejkxbx.supabase.co/rest/v1/students?select=*,classes(name,is_pemula)&id=eq.0a106930-00db-43ac-87c8-adcdb8a40be3&limit=1';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrZ3hocWVzeW51a3pkZWpreGJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MDg5ODcsImV4cCI6MjA5NjM4NDk4N30.yBoywTgm16_fHXpASCycQqxAVU1qXlX_tu62VSAUNWE';

fetch(url, {
  headers: {
    'apikey': key,
    'Authorization': 'Bearer ' + key
  }
})
.then(r => r.json())
.then(data => console.log(JSON.stringify(data, null, 2)))
.catch(console.error);
