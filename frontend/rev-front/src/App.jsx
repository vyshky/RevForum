import Header from './components/Header';
import Categories from './components/Categories';
import Footer from './components/Footer';

const App = () => {
    return (
        <>
        <div>
            <Header />
            <main>
               <Categories />
            </main>
            <Footer />
        </div>
        </>
    );
};

export default App;