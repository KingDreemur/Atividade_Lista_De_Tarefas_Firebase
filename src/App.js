import { useState, useEffect } from "react";
import { db, auth } from './firebaseConnection'; 

import {
  doc,
  setDoc,
  collection,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore'

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'

function App() {
  const [titulo, setTitulo] = useState("");
  const [autor, setAutor] = useState("");
  const [idTarefa, setIdTarefa] = useState("");

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const [tarefas, setTarefas] = useState([]);
  const [user, setUsuario] = useState(null);
  const [detalheUser, setDetalheUser] = useState({});

  useEffect(() => {
    async function carregarTarefas() {
      const unsubscribe = onSnapshot(collection(db, "tarefas"), (snapshot) => {
        let listaTarefa = [];

        snapshot.forEach((doc) => {
          listaTarefa.push({
            id: doc.id,
            titulo: doc.data().titulo,
            autor: doc.data().autor,
          });
        });

        setTarefas(listaTarefa);
      });

      return () => unsubscribe();
    }
    
    carregarTarefas();
  }, []);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsuario(true); // Se tem usuário logado
        setDetalheUser({
          id: user.uid,
          email: user.email
        });
      } else {
        setUsuario(false); // Se não tem usuário logado
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
      if (error.code === "auth/weak-password") {
        alert("Senha muito fraca!");
      } else if (error.code === "auth/email-already-in-use") {
        alert("Email já cadastrado!");
      } else {
        alert("Erro ao criar usuário!");
      }
    }
  }

  async function logarUsuario() {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      setDetalheUser({
        id: userCredential.user.uid,
        email: userCredential.user.email
      });
      setEmail("");
      setSenha("");
    } catch (error) {
      console.log("Erro: " + error);
    }
  }

  async function fazerLogout() {
    await signOut(auth);
    setUsuario(false);
    setDetalheUser({});
  }

  async function adicionarTarefas() {
    if (titulo === "" || autor === "") {
      alert("Preencha todos os campos!");
      return;
    }

    try {
      await addDoc(collection(db, "tarefas"), {
        titulo,
        autor,
      });
      console.log("Cadastro realizado com sucesso");
      setAutor("");
      setTitulo("");
    } catch (error) {
      console.log("Erro: " + error);
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
          titulo: doc.data().titulo,
          autor: doc.data().autor,
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
      await updateDoc(tarefaEditada, {
        titulo,
        autor
      });
      console.log("Tarefa editada com sucesso");
      setIdTarefa("");
      setTitulo("");
      setAutor("");
    } catch (error) {
      console.log("Erro: " + error);
    }
  }

  async function excluirTarefas(id) {
    const TarefaExcluida = doc(db, "tarefas", id);

    try {
      await deleteDoc(TarefaExcluida);
      alert("Tarefa excluído com sucesso");
    } catch (error) {
      console.log("Erro: " + error);
    }
  }

  return (
    <div>
      <h1>Atividade De Lista De Tarefas</h1>
        
      { user && (
        <div>
          <strong>Seja bem-vindo(a) Você esta logado!</strong>
          <span>ID: {detalheUser.id} - Email: {detalheUser.email}</span>
          <br/>
          <button onClick={fazerLogout}>Sair</button>
        </div>
      )}



      <h2>Usuário</h2>

      <label>Email:</label>
      <input
        placeholder="Insira um Email"
        type="text"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      /><br />

      <label>Senha:</label>
      <input
        placeholder="Insira uma Senha"
        type="password"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
      /><br />
      <button onClick={novoUsuario}>Cadastrar</button>
      <button onClick={logarUsuario}>Login</button>
      <button onClick={fazerLogout}>Logout</button>
      <br />

      <hr />
      <h2>Lista De Tarefas</h2>

      <label>ID da Tarefa:</label>
      <input
        placeholder="ID da Tarefa"
        value={idTarefa}
        onChange={(e) => setIdTarefa(e.target.value)}
      /><br />

      <label>Nomes:</label>
      <input
        placeholder="Nomes"
        type="text"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
      /><br />

      <label>Data:</label>
      <input
        placeholder="Data"
        type="text"
        value={autor}
        onChange={(e) => setAutor(e.target.value)}
      /><br />

      <button onClick={adicionarTarefas}>Adicionar</button>
      <button onClick={buscarTarefas}>Buscar</button>
      <button onClick={editarTarefas}>Editar</button>

      <ul>
        {tarefas.map((tarefas) => (
          <li key={tarefas.id}>
            <strong>ID: {tarefas.id}</strong><br />
            <strong>Nomes: {tarefas.titulo}</strong><br />
            <strong>Data: {tarefas.autor}</strong><br />
            <button onClick={() => excluirTarefas(tarefas.id)}>Excluir</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;