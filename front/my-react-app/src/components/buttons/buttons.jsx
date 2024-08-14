

//import { Button } from "@react-email/components";



export function GenericSubmitButton({buttonText ,buttonHandler ,submissionDataObj}){

  return (   

<button className="submitButton"  type="button" onClick={ ()=> buttonHandler(submissionDataObj)} >
  {buttonText}
  </button>
  );
};


export function TransactionButton({buttonText ,buttonHandler ,submissionDataObj}){

  return (   

<button className="submitButton"  type="button" onClick={ ()=> buttonHandler(submissionDataObj)} >
  {buttonText}
  </button>
  );
};


