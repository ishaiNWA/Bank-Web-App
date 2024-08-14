

function FormHandler(e, setFunction) {
    setFunction(e.target.value);
  }
 
  
 export function GenericAuthForm({credential, credentialName , setCredential}){
  
      return (
          <div>
            <form >
                <input
               className="input" 
                  type="text"
                  placeholder={credentialName}
                  value={credential}
                  onChange={(e) => FormHandler(e, setCredential)}
                />
            </form>
          </div>
        );
  }



  export function GenericForm({ inputValue, inputName, setInputValue}) {

    const handleChange = (e) => {
      setInputValue(e.target.value);
    };
  
    return (
      <div>
        <form>
          <input
            className="input"
            type="text"
            placeholder={inputName}
            value={inputValue}
            onChange={(e) => FormHandler(e, setInputValue)}
          />
        </form>
      </div>
    );
  }






