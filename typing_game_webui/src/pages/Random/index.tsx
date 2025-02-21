import { GaurdedLayout } from "../../layouts";
import { useAppSelector, useGenerateText } from "../../hooks";
import { useEffect, useRef, useState } from "react";
import useRecordSubmit from "../../hooks/useRecordSubmit";
import { userSelector } from "../../features/userSlice";

const Random = () => {
  const [textData, loading, generateText] = useGenerateText();
  const [currentWordCompleted, setCurrentWordCompleted] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [wordsTyped, setWordsTyped] = useState([]);
  const [started, setStarted] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [wpm, setWpm] = useState("");
  const [completed, setCompleted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const { submitRecord } = useRecordSubmit();

  useEffect(() => {
    if (started) {
      setStartTime(Date.now());
      inputRef.current?.focus();
    }
  }, [started]);

  const selector = useAppSelector(userSelector);
  useEffect(() => {
    if (elapsedTime != 0 && completed == true) {
      const payload = {
        userName: selector.user?.firstName + " " + selector.user?.lastName,
        email:selector.user?.email,
        UserId: selector.user?.id,
        text: matchData,
        typedText: typedText,
        wpm: wpm,
        accuracy: accuracy.toFixed(2),
        elapsedTime: elapsedTime,
      };
      submitRecord(payload);
    }
  }, [completed, elapsedTime]);

  const calculateAccuracy = () => {
    if (!completed) {
      // If the test is completed, calculate accuracy
      const correctCharacters = typedText.split("").filter((char, index) => char === matchData[index]).length;
      const totalCharacters = matchData.length;
      const accuracyPercentage = (correctCharacters / totalCharacters) * 100;
      setAccuracy(accuracyPercentage);

      return accuracyPercentage;
    }
    return 100; // If the test is not completed, default accuracy to 100%
  };

  const calculateSpeed = () => {
    if (completed || !started) {
      return 0;
    } else {
      const wordCount = wordsTyped.length;
      const timeElapsedInSeconds = (Date.now() - startTime) / 1000;
      const wpmValue = (wordCount / timeElapsedInSeconds) * 60;
      const wpmSpeed: string = wpmValue.toFixed(2);

      setWpm(wpmSpeed);
      setElapsedTime(timeElapsedInSeconds);
      return wpmSpeed;
    }
  };
  let matchData = "";
  for (let i = 0; i < textData.data?.length; i++) {
    matchData += textData.data[i] + " ";
  }
  matchData = matchData.trim();

  let wordTypedSoFar = "";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    calculateSpeed();
    calculateAccuracy();
    const { value } = e.target;
    setTypedText(value);
    wordTypedSoFar += value;

    if (!started) {
      setStarted(true);
    }
    if (wordTypedSoFar === matchData) {
      setCompleted(true);
    } else if (completed) {
      setCompleted(false);
    }
    const totalCharactersTyped = wordTypedSoFar.length;

    // Update the current character index
    setCurrentCharacterIndex(totalCharactersTyped);

    const typedWords = wordTypedSoFar.trim().split(" ");
    setWordsTyped(typedWords);
  };

  const calculateCompletionPercentage = () => {
    if (completed) {
      return 100;
    } else {
      const charactersTyped = typedText.length;
      const totalCharacters = matchData.length;
      const percentageCompleted = (charactersTyped / totalCharacters) * 100;
      let percentageValue = "";
      return percentageValue + Math.round(percentageCompleted);
    }
  };
  const [currentCharacterIndex, setCurrentCharacterIndex] = useState(0);

  const getWordStatus = (index: number) => {
    if (index >= wordsTyped.length) {
      return "default";
    }
    if (wordsTyped[index] !== matchData.split(" ")[index]) {
      return "incorrect";
    }
    if (index === wordsTyped.length - 1 && !currentWordCompleted) {
      return "default";
    }
    if (index === wordsTyped.length - 1 && currentCharacterIndex < matchData.split(" ")[index].length) {
      console.log("this is called");
      return "active-character"; // Add this condition to check if the character index is within the current word
    }
    if (wordsTyped[index] === matchData.split(" ")[index]) {
      // setTypedText(" ");
      return "correct";
    }
    if (index < wordsTyped.length - 1) {
      return "default";
    }
    return "incorrect";
  };

  useEffect(() => {
    setCurrentWordCompleted(false);
  }, [textData]);

  const handleRestart = () => {
    setTypedText("");
    setWordsTyped([]);
    setStarted(false);
    setCompleted(false);
    setAccuracy(100);
    setWpm("0");
    generateText();
    if (inputRef.current) {
      console.log("this is focused");
      inputRef.current?.focus();
    }
  };

  if (loading) {
    return <h1>Loading......</h1>;
  }

  return (
    <GaurdedLayout>
      {!completed ? (
        <>
          <div className="block w-2/3 mt-20 mx-auto p-6 px-8 bg-white border border-gray-200 rounded-lg shadow  dark:bg-gray-800 dark:border-gray-700  ">
            {textData.data?.map((word: string, index: number) => {
              return (
                <span
                  key={index}
                  className={`mb-2 text-2xl font-light bg-inherit tracking-tight text-gray-900 dark:text-white ${
                    getWordStatus(index) ? getWordStatus(index) : "bg-red-500"
                  }`}
                >
                  {word}{" "}
                </span>
              );
            })}

            <p className="font-normal  dark:text-gray-400 bg-inherit pb-6"></p>

            <input
              type="text"
              id="typewords"
              autoFocus={true}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg   
          block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400
           dark:text-white"
              placeholder="Start Typing . . ."
              value={typedText}
              onChange={handleInputChange}
              autoComplete="off"
              ref={inputRef}
            />
            <button
              className=" mt-4 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
              onClick={handleRestart}
            >
              Restart
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="block w-2/3 mt-20 mx-auto p-6 px-8 text-white bg-white border border-gray-200 rounded-lg shadow  dark:bg-gray-800 dark:border-gray-700  ">
            <div className=" bg-inherit">ElapsedTime: {elapsedTime}s</div>
            <div className=" bg-inherit">Accuracy: {accuracy.toFixed(2)}%</div>
            <div className=" bg-inherit">Words Per Minute: {wpm} WPM</div>
            <button className="bg-inherit text-white font-semibold " onClick={handleRestart}>
              Restart
            </button>
          </div>
        </>
      )}
      <div>
        <div className="flex justify-between text-center w-2/3 mt-20 mx-auto p-3 px-8 bg-white border border-gray-200 rounded-lg shadow  dark:bg-gray-800 dark:border-gray-700  ">
          <div className="bg-inherit text-white font-semibold ">Sumit Sharma</div>
          <div className="w-2/3 bg-gray-200 rounded-full h-2 my-auto  dark:bg-gray-700">
            <div className="bg-green-600 h-2 rounded-full dark:bg-green-500" style={{ width: "25%" }}></div>
          </div>
          <div className="bg-inherit text-white font-semibold ">59.88 WPM</div>
        </div>
        <div className="flex justify-between w-2/3 mt-2 mx-auto p-3 px-8 bg-white border border-gray-200 rounded-lg shadow  dark:bg-gray-800 dark:border-gray-700  ">
          <div className="bg-inherit text-white font-semibold">Gaurav Singh</div>
          <div className="w-2/3  bg-gray-200 rounded-full h-2 my-auto   dark:bg-gray-700">
            <div
              className="bg-green-600 h-2 rounded-full dark:bg-green-500"
              style={{ width: `${calculateCompletionPercentage()}%` }}
            ></div>
          </div>
          <div className="bg-inherit text-white font-semibold ">{wpm} WPM</div>
        </div>
      </div>
    </GaurdedLayout>
  );
};

export default Random;
