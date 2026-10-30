import './App.css'
import ActionButton from './components/ui/Button/ActionButton'
import CommunityCard from './components/ui/Card/CommunityCard'

import RegisterForm from './components/ui/Form/RegisterForm'
import SelectField from './components/ui/Field/SelectField'

function App() {

  return (
    <>

          <SelectField
        label="Curso"
        name="curso"
        options={[
          { value: "dev", label: "Desenvolvimento" },
          { value: "design", label: "Design" },
          { value: "dados", label: "Dados" },
        ]}
        onChange={(value) => console.log(value)}
      />

      <ActionButton className="fill">
        Click me
      </ActionButton>

      <br />

      <ActionButton className="outline">
        Click me
      </ActionButton>


      <br />
      <CommunityCard
        title="My Community"

        description="lorem  ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor. asfasfasfafafafasfafaffsasadscsfdf"

        icon="/path/to/icon.svg"
        imageUrl="/path/to/image.jpg">
      </CommunityCard>

      <br />

      {/* <PasswordField />
      <InputField /> */}

      <br />

      <RegisterForm />

      <br />
    </>
  )
}

export default App
