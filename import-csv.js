const fs = require("fs");

function parseGpm(gpmString) {
  if (!gpmString || gpmString === "N/A" || gpmString === "N/A GPM") {
    return "N/A";
  }
  const numbers = gpmString.match(/\d+(?:\.\d+)?/g);
  if (!numbers) return "N/A";
  if (numbers.length === 1) {
    return `${numbers[0]} GPM`;
  } else if (numbers.length >= 2) {
    return `${numbers[0]}-${numbers[1]} GPM`;
  }
  return gpmString;
}

function convertCsvToTypescript() {
  try {
    const csvPath = "c:/Users/annak/Downloads/Untitled spreadsheet - Skid Steer.csv";
    const csvContent = fs.readFileSync(csvPath, "utf8");
    const lines = csvContent.split("\n").filter(line => line.trim());
    const headers = lines[0].split(",").map(h => h.trim());
    
    console.log("CSV Headers:", headers);
    
    const manufactureIndex = headers.findIndex(h => h.toLowerCase().includes("manufacture"));
    const modelIndex = headers.findIndex(h => h.toLowerCase().includes("model"));
    const standardFlowIndex = headers.findIndex(h => h.toLowerCase().includes("standard flow"));
    const highFlowIndex = headers.findIndex(h => h.toLowerCase().includes("high flow"));
    
    console.log("Column indices:", { manufactureIndex, modelIndex, standardFlowIndex, highFlowIndex });
    
    const machines = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const values = line.split(",").map(v => v.trim());
      if (values.length < 4) continue;
      
      const manufacture = values[manufactureIndex] || "";
      const model = values[modelIndex] || "";
      const standardFlow = parseGpm(values[standardFlowIndex] || "");
      const highFlow = parseGpm(values[highFlowIndex] || "");
      
      if (manufacture && model) {
        machines.push({
          manufacture: manufacture.replace(/"/g, ""),
          model: model.replace(/"/g, ""),
          standardFlow,
          highFlow
        });
      }
    }
    
    console.log(`Found ${machines.length} machines`);
    
    const tsContent = `// Complete CSV machine data from "Untitled spreadsheet - Skid Steer.csv"
export interface CSVMachine {
  manufacture: string;
  model: string;
  standardFlow: string;
  highFlow: string;
}

export const csvMachines: CSVMachine[] = [
${machines.map(machine => 
  `  { manufacture: "${machine.manufacture}", model: "${machine.model}", standardFlow: "${machine.standardFlow}", highFlow: "${machine.highFlow}" }`
).join(",\n")}
];
`;
    
    const outputPath = "src/data/csvMachines.ts";
    fs.writeFileSync(outputPath, tsContent, "utf8");
    
    console.log(` Successfully imported ${machines.length} machines to ${outputPath}`);
    
    console.log("\nSample machines:");
    machines.slice(0, 10).forEach(m => {
      console.log(`  ${m.manufacture} ${m.model}: ${m.standardFlow} / ${m.highFlow}`);
    });
    
    const counts = {};
    machines.forEach(m => {
      counts[m.manufacture] = (counts[m.manufacture] || 0) + 1;
    });
    console.log("\nMachines by manufacturer:");
    Object.entries(counts).forEach(([make, count]) => {
      console.log(`  ${make}: ${count} models`);
    });
    
    const caseModels = machines.filter(m => m.manufacture === "Case");
    console.log("\nCase models found:");
    caseModels.forEach(m => {
      console.log(`  ${m.model}: ${m.standardFlow} / ${m.highFlow}`);
    });
    
  } catch (error) {
    console.error("Error importing CSV:", error.message);
    console.log("\nTroubleshooting:");
    console.log("1. Make sure the CSV file exists at: c:/Users/annak/Downloads/Untitled spreadsheet - Skid Steer.csv");
    console.log("2. Check that the CSV has the expected column headers");
    console.log("3. Verify the file is readable");
  }
}

convertCsvToTypescript();
