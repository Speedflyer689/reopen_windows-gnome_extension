#!/bin/bash

wmctrl -l -p > windowlist

echo "#!/bin/bash" > commands.sh;
while read line
do
    workspace=$(echo $line | awk '{print $2}')
    command=$(ps -o cmd= -p `echo $line | awk '{print $3}'`)
    echo "wmctrl -s " $workspace ';' $command ';' >> commands.sh
done < windowlist;