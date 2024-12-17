# Netronome Setup

## Download Netronome

To download the Netronome, click the green `Code` button above, and select `Download Zip`

![image](https://github.com/user-attachments/assets/621fa647-7cb9-4f7d-aa59-a9969c5b5bc2)

## Install JackTrip

- The Netronome was designed to manage the timing of audio being streamed via JackTrip, which you can download [here](https://www.jacktrip.com/download).

## Install Loopback Software

- In order to route audio between JackTrip and the Netronome, you will need either [Jack Audio Router](https://jackaudio.org/downloads/) (Windows) or [Rogue Amoeba's Loopback](https://rogueamoeba.com/loopback/) (Mac).

## Max Patch Setup
  
### Windows

#### Routing

<details>
  <summary>Video</summary>
    <video width = 320, height = 240, src="https://github.com/user-attachments/assets/2c135716-f1d0-4ee7-ba79-496d57339531" controls></video>
</details>

<details>
<summary>Step by Step</summary>
1. Open JACK Audio Router and click the `Start` button

![image](https://github.com/user-attachments/assets/acf8b0ac-fdca-47e7-9a8c-361733125753)

2. Click the `Graph` button to display audio devices

![image](https://github.com/user-attachments/assets/5e17489c-36fd-42d0-b1b6-f3518ca82311)

3. Open JackTrip, and click the `Settings` button

![image](https://github.com/user-attachments/assets/8ca3561e-190a-4250-8777-98938795e5c7)

4. In the Settings window, Click the `Advanced` tab

![image](https://github.com/user-attachments/assets/48c490e3-b758-46b9-be24-20249b3dc4c7)

5. From the `Audio Backend` menu in JackTrip, select "JACK" (JackTrip should then be visible in the JACK Audio Router Graph)

![image](https://github.com/user-attachments/assets/4fa67678-7d5b-446b-9096-155721e12adf)

6. In JackTrip, click the `Save` button

![image](https://github.com/user-attachments/assets/86c95493-1132-4940-9a39-9984f5a5b2c1)

7. Join a JackTrip studio from the "Your Studios" menu

![image](https://github.com/user-attachments/assets/f7f0cfce-66ee-48eb-8262-a2bcbdcebdcd)

8. Click `Connect to Session`

![image](https://github.com/user-attachments/assets/7492950d-f56e-497c-9ce2-efc6f9d81ccb)

9. Once you have connected to the studio in JackTrip, disconnect all connections to JackTrip In the JACK Audio Router Graph by clicking the JackTrip box, and pressing `Ctrl + D`

![image](https://github.com/user-attachments/assets/ea18086d-1f20-42d2-bba7-4883b0d9a5e5)

10. In JACK Audio Router, connect desired system inputs to outputs by click-dragging from desired input to the desired output (In the example, a microphone connected to the first input of a Focusrite Scarlett 8i6 is connected to the interface's 1st and 2nd outputs).

![image](https://github.com/user-attachments/assets/6fe6e988-1c77-46be-b781-9d629f8c7f9a)

11. Within the `Netronome-main` folder downloaded from the "Download Netronome" step above, open the `MaxPatch` folder, and open `Netronome.maxpat`

![image](https://github.com/user-attachments/assets/31cc631d-3e07-461f-b94a-bde0acda310f)

12. From the `Audio Driver` menu, select JACK Audio Router

![image](https://github.com/user-attachments/assets/f72435dd-9139-42a6-8103-e0d7f349b0f1)

13. Click the button next to the `Audio Driver` so that it says "Audio On" (Max should then be visible in the JACK Audio Router Graph)

![image](https://github.com/user-attachments/assets/f717bf1f-3fb9-4f51-9926-ff07ec5bdce7)

14. In JACK Audio Router, connect desired system inputs to Max inputs.

![image](https://github.com/user-attachments/assets/c37d09b0-5386-42d7-8fad-97aeb188ffdc)

15. In Max, configure the `Local Input #` menus to match the connections set in step 14.

![image](https://github.com/user-attachments/assets/802a88fb-f9be-4e89-9bac-6f7678df101f)

16. In JACK Audio Router, connect Max Outputs to JackTrip inputs.

![image](https://github.com/user-attachments/assets/2246cc9b-f52e-4c64-96e7-dc1fd23ed095)

17. In Max, configure the `To Jacktrip-#` menus to match the connections set in the step 16.

![image](https://github.com/user-attachments/assets/e733da7e-93f1-476b-8249-6c80c64deb26)

18. In JACK Audio Router, connect the JackTrip outputs to empty Max inputs.

![image](https://github.com/user-attachments/assets/dfc6f583-e707-4bbe-8ab8-c390f971b390)

19. In Max, configure the `From JackTrip-#` menus to match the connections set in step 18.

![image](https://github.com/user-attachments/assets/38b15980-1e98-41e8-839a-d2861fdc7031)

20. In JACK Audio Router, connect Max Outputs to system outputs.

![image](https://github.com/user-attachments/assets/c333e40d-b0b9-4bff-ad54-ebd045ae585e)

21. In Max, configure the `Local Output #` menus to match the connections set in setp 20.

![image](https://github.com/user-attachments/assets/816ae977-d721-40d2-8d1a-9b575b62f147)

22. In the `QUANTIZATION` portion of the Max Patch, set desired BPM and beat length values.

![image](https://github.com/user-attachments/assets/35b4c368-0fd7-4434-8c6b-02f3c68edaf8)

23. In the `LATENCY` portion of the Max Patch, set the `Latency` number box to match the value displayed in JackTrip
  - 23a. The `-` and `+` buttons to the left and right of the number box will adjust the value by millisecond increments.
  - 23b. The `METRONOME` section below `LATENCY COMPENSATION` can be used to check your timing against the `QUANTIZATION` settings.
  - 23c. Additional help with latency calibration can be found in the `Automatic Latency Calibration` section below.

![image](https://github.com/user-attachments/assets/0837ceac-3b86-462a-87ad-0c7c545c4d78)

24. PLAY!!!
</details>

#### Automatic Latency Calibration

<details>
  <summary>Video</summary>
  <video width = 320, height = 240, src="https://github.com/user-attachments/assets/5351da70-3164-4051-a3ca-239097040ef8" controls></video>
</details>

<details>
  <summary>Step by Step</summary>
</details>

</details>

#### Presets

<details>
  <summary>Video</summary>
    <video width = 320, height = 240, src="https://github.com/user-attachments/assets/13d96c98-2607-40ad-8da9-dc070f4525ee" controls></video>
  <summary></summary>
</details>

<details>
  <summary>Step By Step</summary>
</details>

### Mac

#### Routing

#### Automatic Latency Calibration

#### Creating presets

## Max For Live Setup

### Routing

### Windows

#### Routing

#### Automatic Latency Calibration

### Mac

#### Routing

#### Automatic Latency Calibration
