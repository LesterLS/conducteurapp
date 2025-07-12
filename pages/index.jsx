import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Button, Card, Checkbox, Input } from 'semantic-ui-react';
import supabase from '../lib/supabaseClient';

// Remove imports of your own UI components and remove the second supabase creation

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function HalloConducteur() {
  const [user, setUser] = useState(null);
  const [treinstel, setTreinstel] = useState('');
  const [meldingen, setMeldingen] = useState([]);
  const [seen, setSeen] = useState([]);
  const [notify, setNotify] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(res => setUser(res.data.user));
    supabase.auth.onAuthStateChange((_e, s)=> setUser(s?.user || null));
  }, []);

  useEffect(() => {
    let iv;
    if (user && treinstel) {
      fetchMeldingen();
      iv = setInterval(fetchMeldingen,15000);
    }
    return ()=> clearInterval(iv);
  }, [user, treinstel, notify]);

  const fetchMeldingen = async () => {
    const fifteenAgo = new Date(Date.now() - 15*60000).toISOString();
    const { data } = await supabase
      .from('meldingen')
      .select('*')
      .eq('treinstelnummer', treinstel)
      .gt('created_at', fifteenAgo);
    setMeldingen(data ?? []);
    if (notify && Notification.permission==='granted' && data.length) {
      new Notification(`Controle treinstel ${treinstel}`);
    }
  };

  const plaatsMelding = async () => {
    await supabase
      .from('meldingen')
      .insert({ treinstelnummer: treinstel });
    fetchMeldingen();
  };

  const afvinken = id => setSeen(prev => [...prev,id]);

  const login = async e => {
    await supabase.auth.signInWithOtp({ email: e.target.value });
    alert('Check je e‑mail!');
  };

  useEffect(() => {
    if ('Notification' in window && Notification.permission!=='granted') {
      Notification.requestPermission();
    }
  }, []);

  if (!user) {
    return (
      <div style={{ display:'flex',height:'100vh',justifyContent:'center',alignItems:'center' }}>
        <div>
          <h1>Hallo Conducteur – Inloggen</h1>
          <Input placeholder="Jouw e‑mail" onBlur={login} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <h1>Hallo Conducteur</h1>
      <Input
        fluid
        placeholder="Treinstelnummer"
        value={treinstel}
        onChange={e=>setTreinstel(e.target.value)}
      />
      {treinstel && (
        <Button
          primary
          onClick={plaatsMelding}
          style={{ margin: '1rem 0' }}
        >
          Meld controle in treinstel {treinstel}
        </Button>
      )}
      <Checkbox
        label="Geen meldingen meer ontvangen"
        checked={!notify}
        onChange={(_, d)=>setNotify(!d.checked)}
      />
      <div>
        {meldingen
          .filter(m=>!seen.includes(m.id))
          .map(m=>(
            <Card key={m.id} fluid>
              <Card.Content>
                <Card.Header>Controle gemeld!</Card.Header>
                <Card.Meta>
                  om {new Date(m.created_at).toLocaleTimeString()}
                </Card.Meta>
                <Button
                  compact
                  size="tiny"
                  floated="right"
                  onClick={()=>afvinken(m.id)}
                >
                  Afvinken
                </Button>
              </Card.Content>
            </Card>
          ))}
      </div>
    </div>
  );
}
