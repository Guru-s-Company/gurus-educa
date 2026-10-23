import './App.css'
import ActionButton from './components/ui/Button/ActionButton'
import CommunityCard from './components/ui/Card/CommunityCard'
import PasswordField from './components/ui/Field/PasswordField'
import TextField from './components/ui/Field/TextField'

function App() {

  return (
    <>

      <ActionButton className="fill">
        Click me
      </ActionButton>

      <br/>

      <ActionButton className="outline">
        Click me
      </ActionButton>


      <br/>
      <CommunityCard 
        title="My Community"

        description="lorem  ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor. asfasfasfafafafasfafaffsasadscsfdf"

        icon="/path/to/icon.svg"
        imageUrl="/path/to/image.jpg">
      </CommunityCard>

      <br/>

      <PasswordField />
      <TextField />
    </>
  )
}

export default App
