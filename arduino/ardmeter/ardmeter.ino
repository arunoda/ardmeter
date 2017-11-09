void setup() {
  Serial.begin(9600);
}

float toVolt(int val) {
  return (val/1024.0) * 5.0;
}

void loop() {
  // put your main code here, to run repeatedly:
  float a6 = toVolt(analogRead(6));
  float a7 = toVolt(analogRead(7));

  float i = ((a6 - a7) / 100.0) * 1000000;
  Serial.println(String(i) + "uA");

  delay(250);
}

// Real, Our
// 150, 200
// 5400, 5800
// 1420, 1560
