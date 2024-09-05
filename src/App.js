import { useState, useEffect } from "react";
import { db, auth } from './firebaseConnection'; 
import {
  doc, setDoc, collection, addDoc, getDocs, updateDoc, deleteDoc, onSnapshot
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged
} from 'firebase/auth';
import './App.css';  // Linkando o novo CSS

function App() {
  const [nomes, setNomes] = useState("");
  const [data, setData] = useState("");
  const [idTarefa, setIdTarefa] = useState("");

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const [tarefas, setTarefas] = useState([]);
  const [user, setUsuario] = useState(null);
  const [detalheUser, setDetalheUser] = useState({});

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "tarefas"), (snapshot) => {
      let listaTarefa = [];
      snapshot.forEach((doc) => {
        listaTarefa.push({
          id: doc.id,
          nomes: doc.data().nomes,
          data: doc.data().data,
        });
      });
      setTarefas(listaTarefa);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsuario(true);
        setDetalheUser({ id: user.uid, email: user.email });
      } else {
        setUsuario(false);
        setDetalheUser({});
      }
    });
  }, []);

  async function novoUsuario() {
    try {
      await createUserWithEmailAndPassword(auth, email, senha);
      setEmail("");
      setSenha("");
    } catch (error) {
      alert("Erro ao criar usuário!");
    }
  }

  async function logarUsuario() {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      setDetalheUser({ id: userCredential.user.uid, email: userCredential.user.email });
      setEmail("");
      setSenha("");
    } catch (error) {
      alert("Erro ao fazer login");
    }
  }

  async function fazerLogout() {
    await signOut(auth);
    setUsuario(false);
    setDetalheUser({});
  }

  async function adicionarTarefas() {
    if (nomes === "" || data === "") {
      alert("Preencha todos os campos!");
      return;
    }

    try {
      await addDoc(collection(db, "tarefas"), { nomes, data });
      setData("");
      setNomes("");
    } catch (error) {
      alert("Erro ao adicionar tarefa");
    }
  }

  async function buscarTarefas() {
    const dados = collection(db, "tarefas");

    try {
      const snapshot = await getDocs(dados);
      let listaTarefa = [];

      snapshot.forEach((doc) => {
        listaTarefa.push({
          id: doc.id,
          nomes: doc.data().nomes,
          data: doc.data().data,
        });
      });

      setTarefas(listaTarefa);
    } catch (error) {
      console.log("Erro: " + error);
    }
  }

  async function editarTarefas() {
    if (idTarefa === "") {
      alert("Preencha o ID da Tarefa");
      return;
    }

    const tarefaEditada = doc(db, "tarefas", idTarefa);

    try {
      await updateDoc(tarefaEditada, { nomes, data });
      setIdTarefa("");
      setNomes("");
      setData("");
    } catch (error) {
      alert("Erro ao editar tarefa");
    }
  }

  async function excluirTarefas(id) {
    const TarefaExcluida = doc(db, "tarefas", id);

    try {
      await deleteDoc(TarefaExcluida);
      alert("Tarefa excluída com sucesso");
    } catch (error) {
      console.log("Erro: " + error);
    }
  }

  return (
    <div className="app-container">
      <header>
        <h1>Lista de Tarefas</h1>
        <div className="login-section">
          <label>Email:</label>
          <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Digite seu email"/>
          <label>Senha:</label>
          <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Digite sua senha"/>
          <button onClick={logarUsuario}>Login</button>
          <button onClick={novoUsuario}>Cadastrar</button>
          <button onClick={fazerLogout}>Logout</button>
        </div>
        {user && (
          <div className="user-info">
            <strong>Bem-vindo, {detalheUser.email}!</strong>
          </div>
        )}
      </header>

      <main>
        <section className="task-form">
          <h2>Adicionar/Editar Tarefa</h2>
          <input
            type="text"
            placeholder="ID da Tarefa"
            value={idTarefa}
            onChange={(e) => setIdTarefa(e.target.value)}
          />
          <input
            type="text"
            placeholder="Nome"
            value={nomes}
            onChange={(e) => setNomes(e.target.value)}
          />
          <input
            type="text"
            placeholder="Data"
            value={data}
            onChange={(e) => setData(e.target.value)}
          />
          <button onClick={adicionarTarefas}>Adicionar Tarefa</button>
          <button onClick={buscarTarefas}>Buscar Tarefas</button>
          <button onClick={editarTarefas}>Editar Tarefa</button>
        </section>

        <section className="task-preview">
          <h2>Tarefas Criadas</h2>
          <ul>
            {tarefas.map((tarefa) => (
              <li key={tarefa.id}>
                <strong>{tarefa.nomes}</strong> - {tarefa.data}
                <button onClick={() => excluirTarefas(tarefa.id)}>Excluir</button>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

export default App;
