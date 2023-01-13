import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import ReactCountdownClock from "react-countdown-clock";

function App() {
  const { register, handleSubmit, setFocus, getValues, reset } = useForm();

  const [frases, setFrases] = useState([]);
  const [frase, setFrase] = useState(null);
  const [formData, setFormData] = useState(null);
  const [submited, setSubmited] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isCorrect, setIsCorrect] = useState();

  // fetch to get the information from information.json
  const getFrases = async () => {
    const response = await fetch("information.json");
    const data = await response.json();
    setFrases(data);
  };

  // function to get a random phrase
  const getRandomFrase = () => {
    const randomNumero = Math.floor(Math.random() * frases.length);
    const randomFrase = frases[randomNumero];
    setFrase(randomFrase);
    // remove the phrase that was taken
    const newFrases = frases;
    newFrases.splice(randomNumero, 1);
    setFrases(newFrases);
    restart();
  };

  // function to restart the form
  const restart = () => {
    setIsCorrect(null);
    setSubmited(false);
    reset();
  };

  // useEffect to execute only once
  useEffect(() => {
    getFrases();
  }, []);

  // useEffect to execute when setFrases changes
  useEffect(() => {
    if (frases.length > 0) {
      getRandomFrase();
    }
  }, [frases]);

  // detect when you press the keys
  useEffect(() => {
    const handleKeyDown = (e) => {
      // detect the name by active element
      const activeElementName = document.activeElement.name;
      // separete the name of the active element
      const activeElementNameArray = activeElementName.split("-");
      // remove what is not a number
      const finalNumbers = activeElementNameArray.filter(
        (item) => !isNaN(item)
      );
      // convert to number
      finalNumbers.map((item, index) => {
        finalNumbers[index] = parseInt(item);
        return finalNumbers[index];
      });

      // detect when you press up or right
      if (e.key === "ArrowRight" || e.key === "ArrowUp") {
        // if the input name has only one number
        if (finalNumbers.length === 1) {
          // try to go to the next subinput
          const path = `answer-${finalNumbers[0]}-1`;
          if (getValues(path) || getValues(path) === "") {
            setFocus(path);
          } else {
            // if not go to the next input
            setFocus(`answer-${finalNumbers[0] + 1}`);
          }
        } else {
          // else go to the next subinput
          const path = `answer-${finalNumbers[0]}-${finalNumbers[1] + 1}`;
          if (getValues(path) || getValues(path) === "") {
            setFocus(path);
          } else {
            // else go to the next input
            setFocus(`answer-${finalNumbers[0] + 1}`);
          }
        }
      }
      // detect when you press down or left
      if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
        // if the input name has only one number
        if (finalNumbers.length === 1) {
          const previousInput =
          //  if the input is the first one
            finalNumbers[0] > 0
              ? frase.correct_answers[finalNumbers[0] - 1].length - 1
              : frase.correct_answers[0].length - 1;
          // get the path of the previous input
          const path = `answer-${finalNumbers[0] - 1}-${previousInput}`;
          // if the previous input exists 
          if (getValues(path) || getValues(path) === "") {
            setFocus(path);
          }
          // if the previous input is the first one
          if (previousInput === 0) {
            let path = `answer-${finalNumbers[0] - 1}`;
            if (getValues(path) || getValues(path) === "") {
              setFocus(path);
            }
          }
        } else {
          // try to go to the next subinput
          if (
            getValues(`answer-${finalNumbers[0]}-${finalNumbers[1] - 1}`) ||
            getValues(`answer-${finalNumbers[0]}-${finalNumbers[1] - 1}`) === ""
          ) {
            setFocus(`answer-${finalNumbers[0]}-${finalNumbers[1] - 1}`);
          } else {
            // if not go to the next input
            setFocus(`answer-${finalNumbers[0]}`);
          }
        }
      }
      // detect when you press the backspace
      if (e.key === "Backspace") {
        // get the current input value
        const currentInputValue = document.activeElement.value;
        // if the current input value is empty
        if (currentInputValue === "") {
          // if the input name has only one number
          if (finalNumbers.length === 1) {
            // get the previous input
            const previousInput =
              finalNumbers[0] > 0
                ? frase.correct_answers[finalNumbers[0] - 1].length - 1
                : frase.correct_answers[0].length - 1;
            const path = `answer-${finalNumbers[0] - 1}-${previousInput}`;
            // if the previous input exists
            if (getValues(path) || getValues(path) === "") {
              setFocus(path);
              // if the previous input is the first one
            }
            if (previousInput === 0) {
              // get the previous input
              let test = `answer-${finalNumbers[0] - 1}`;
              if (getValues(test) || getValues(test) === "") {
                setFocus(test);
              }
            }
          } else {
            // else find the previous subinput
            if (
              getValues(`answer-${finalNumbers[0]}-${finalNumbers[1] - 1}`) ||
              getValues(`answer-${finalNumbers[0]}-${finalNumbers[1] - 1}`) ===
                ""
            ) {
              setFocus(`answer-${finalNumbers[0]}-${finalNumbers[1] - 1}`);
            } else {
              setFocus(`answer-${finalNumbers[0]}`);
            }
          }
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setFocus, getValues, frase]);

  const onSubmit = (data) => {
    // join the answers
    let counter = 0;
    let newData = data;
    for (const [key] of Object.entries(newData)) {
      if (key.includes(`-${counter}-`)) {
        const mainAnswer = `answer-${counter}`;
        let newValue =
          newData[mainAnswer].toLowerCase() + newData[key].toLowerCase();
        newData[mainAnswer] = newValue;
        delete newData[key];
      }
      if (key === `answer-${counter + 1}`) {
        counter++;
      }
      if (key === `answer-${counter}`) {
        newData[key] = newData[key].toLowerCase();
      }
    }
    // set the data and submited to true
    setFormData(data);
    setSubmited(true);

    // convert sentence.correct answers to object
    const correct_answers = frase.correct_answers.reduce((acc, item, index) => {
      acc[`answer-${index}`] = item;
      return acc;
    }, {});
    // compare the answers
    if (JSON.stringify(data) === JSON.stringify(correct_answers)) {
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
    }
  };

  return (
    <div className="App bg-black w-full min-h-screen flex items-center justify-center">
      {isStarted ? (
        frase ? (
          <div className="px-10">
            {/* Countdown */}
            <div className="w-full flex justify-end">
              <ReactCountdownClock
                weight={10}
                seconds={!submited ? 180 : 0}
                color="#fff"
                size={80}
                paused={submited}
                onComplete={handleSubmit(onSubmit)}
              />
            </div>
            {/* Form with white space */}
            <form onSubmit={handleSubmit(onSubmit)}>
              <h1 className=" text-4xl font-bold  text-white text-center py-5">
                Type the missing letters to complete the text below
              </h1>
              <div className="flex flex-wrap">
                {frase.sentence.map((item, index) => {
                  return (
                    <div className="flex flex-wrap" key={`div-${index}`}>
                      <span
                        className="text-xl text-white"
                        key={`sentence-${index}`}
                      >
                        {item}
                      </span>
                      <div
                        className="flex gap-0.5 mr-1"
                        key={`inputContainer-${index}`}
                      >
                        {!submited ? (
                          // frase.correct_answers[index].length
                          index === frase.sentence.length - 1 ? null : (
                            // repeat the input the times of frase.correct_answers.length
                            Array.from(
                              { length: frase.correct_answers[index].length },
                              (v, i) => {
                                return (
                                  // onChange detect when the input is full go to the next input
                                  i > 0 ? (
                                    <input
                                      type="text"
                                      key={`input-${index}-${i}`}
                                      className="bg-[#5F676B] border-2 border-gray-700 text-orange-600 focus:border-orange-600 outline-none text-xl w-6 text-center rounded-t-md"
                                      {...register(`answer-${index}-${i}`, {
                                        onChange: (e) => {
                                          e.target.value.length >= 1
                                            ? e.target.value.length >= 2
                                              ? (e.target.value =
                                                  e.target.value.slice(-1))
                                              : getValues(
                                                  `answer-${index}-${i + 1}`
                                                ) !== undefined
                                              ? setFocus(
                                                  `answer-${index}-${i + 1}`
                                                )
                                              : setFocus(`answer-${index + 1}`)
                                            : setFocus(`answer-${index}-${i}`);
                                        },
                                      })}
                                    />
                                  ) : (
                                    // onChange detect when the input is full go to the next input
                                    <input
                                      type="text"
                                      key={`input-${index}`}
                                      className="bg-[#5F676B] border-2 border-gray-700 text-orange-600 focus:border-orange-600 outline-none text-xl w-6 text-center rounded-t-md"
                                      {...register(`answer-${index}`, {
                                        onChange: (e) => {
                                          e.target.value.length >= 1
                                            ? e.target.value.length >= 2
                                              ? (e.target.value =
                                                  e.target.value.slice(-1))
                                              : getValues(
                                                  `answer-${index}-${i + 1}`
                                                ) !== undefined
                                              ? setFocus(
                                                  `answer-${index}-${i + 1}`
                                                )
                                              : setFocus(`answer-${index + 1}`)
                                            : setFocus(`answer-${index}`);
                                        },
                                      })}
                                    />
                                  )
                                );
                              }
                            )
                          )
                        ) : formData[`answer-${index}`] ===
                          frase.correct_answers[index] ? (
                          <span
                            className="text-xl text-green-600 mr-2"
                            key={`answer-${index}`}
                          >
                            {frase.correct_answers[index]}
                          </span>
                        ) : formData[`answer-${index}`] ? (
                          <span
                            className="text-xl text-red-600 mr-2"
                            key={`answer-${index}`}
                          >
                            {formData[`answer-${index}`]}
                          </span>
                        ) : (
                          <span
                            className="text-xl text-yellow-400  -600 mr-2"
                            key={`answer-${index}`}
                          >
                            {frase.correct_answers[index]}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {!submited ? (
                <div className="w-full flex justify-end ">
                  <input
                    type="submit"
                    value="Submit"
                    className="mt-6 bg-green-500  text-white p-2 w-24 cursor-pointer rounded-xl"
                  />
                </div>
              ) : null}
            </form>
            {/* button repeat and next */}
            <>
              {submited ? (
                <div className="w-full flex justify-between">
                  <input
                    type="submit"
                    value="Repeat"
                    onClick={() => {
                      restart();
                    }}
                    className="mt-6 bg-blue-500  text-white p-2 w-24 cursor-pointer rounded-xl"
                  />
                  <input
                    type="submit"
                    value="Next"
                    onClick={() => {
                      getRandomFrase();
                    }}
                    className="mt-6 bg-green-500  text-white p-2 w-24 cursor-pointer rounded-xl"
                  />
                </div>
              ) : null}
              {isCorrect === true ? (
                <div className="w-full flex justify-center">
                  {/* Colocar una imagen gif */}
                  <img
                    src="https://i.giphy.com/media/yziuK6WtDFMly/giphy.webp"
                    alt="gif"
                    className=" w-96 h-80"
                  />
                </div>
              ) : isCorrect === false ? (
                <div className="w-full flex justify-center">
                  {/* Colocar una imagen gif */}
                  <img
                    src="https://i.giphy.com/media/S4BDGxHKIB6nW9PiyA/giphy.webp"
                    alt="gif"
                    className="w-96 h-80"
                  />
                </div>
              ) : null}
            </>
          </div>
        ) : (
          <h1 className="text-xl text-white">the sentences are over 😢😢</h1>
        )
      ) : (
        // main page with the start button
        <div className="flex flex-col items-center">
          <h1 className="text-4xl text-white font-bold mb-3 ">
            Welcome to the test
          </h1>
          <p className="text-xl text-white">
            You will have 3 minutes to complete the test
          </p>
          <input
            type="submit"
            value="Start"
            className="mt-6 bg-green-500  text-white p-2 w-24 cursor-pointer rounded-xl"
            onClick={() => {
              setIsStarted(true);
            }}
          />
        </div>
      )}
    </div>
  );
}

export default App;
