import React, { useRef, useEffect } from "react";
import BpmnModeler from "bpmn-js/lib/Modeler";
import axios from "axios";

const ProcessDesigner = () => {
  const modelerRef = useRef(null);

  useEffect(() => {
    modelerRef.current = new BpmnModeler({
      container: "#bpmn-container",
    });
  }, []);

  const handleSave = async () => {
    const result = await modelerRef.current.saveXML({ format: true });
    const xmlData = result.xml;
    const name = prompt("Süreç adı giriniz:");
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      await axios.post(
        "/api/processes",
        { name, xmlData },
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        }
      );
      alert("Süreç başarıyla kaydedildi.");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div id="bpmn-container" style={{ width: "100%", height: "500px" }}></div>
      <button onClick={handleSave}>Kaydet</button>
    </div>
  );
};

export default ProcessDesigner;
